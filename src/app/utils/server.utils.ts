import '@fastify/cookie';
import '@fastify/session';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { Employee } from 'enterprise/employee/employee.entity';
import { EventTag } from 'event/tag/tag.entity';
import { Notification } from 'notification/notification.entity';
import { Event } from 'event/event.entity';
import { EventCreator } from 'event/creator/creator.entity';
import fastifyHelmet from '@fastify/helmet';
import { FastifyInstance, FastifyServerOptions } from 'fastify';
import { User, UserRecieve } from 'user/user.entity';
import { Hook } from 'app/hook/hook.entity';
import { ConfigService } from '@nestjs/config';
import { AppService } from 'app/app.service';
import { OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import fastifyCsrf, { CookieSerializeOptions } from '@fastify/csrf-protection';
import fastifySecuredSession from '@fastify/secure-session';
import { readFileSync } from 'fs';
import { AppMiddleware } from 'app/app.middleware';
import fastifyCompression from '@fastify/compress';
import { constants } from 'zlib';
import { IRefreshResult } from 'auth/guards';
import { JwtService } from '@nestjs/jwt';

/**
 * Modified fastify interfaces
 */
declare module 'fastify' {
	/**
	 * Server request
	 */
	interface FastifyRequest {
		user: User;
		hook: Hook;
		refresh: IRefreshResult;
		isMultipart: boolean;
	}

	/**
	 * Server reply
	 */
	interface FastifyReply {
		body: UserRecieve;
	}

	/**
	 * Server session addition fields
	 */
	interface Session {
		redirectTo: string;
	}
}

/**
 * Fastify server options
 */
export const fastifyOptions: FastifyServerOptions = { maxParamLength: 128 };

/**
 * Cookie option properties
 */
export type CookieProps = { name: string; password: string };

/**
 * Register fastify plugins
 */
export async function registerServerPlugins(
	fastify: FastifyInstance,
	{ password = (32).string, name = (6).string }: Partial<CookieProps>,
) {
	const secret = password,
		cookieOptions: CookieSerializeOptions = {
			httpOnly: true,
			signed: true,
			secure: true,
			sameSite: 'strict',
		};

	await fastify
		.register(fastifyCompression, {
			encodings: ['gzip', 'deflate'],
			brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } },
		})
		.register(fastifySecuredSession, {
			cookieName: (6).numeric.toBase64Url,
			cookie: { ...cookieOptions, signed: true },
			secret,
			key: readFileSync('securedSessionKey'),
			salt: (256).string,
		})
		.register(fastifyCsrf, {
			sessionKey: name,
			cookieKey: (6).alpha.toBase64Url,
			cookieOpts: cookieOptions,
			sessionPlugin: '@fastify/secure-session',
			csrfOpts: { validity: (180).s2ms },
		})
		.register(fastifyHelmet, {
			contentSecurityPolicy: {
				directives: {
					defaultSrc: [`'self'`, 'unpkg.com'],
					styleSrc: [
						`'self'`,
						`'unsafe-inline'`,
						'cdn.jsdelivr.net',
						'fonts.googleapis.com',
						'unpkg.com',
					],
					fontSrc: [`'self'`, 'fonts.gstatic.com', 'data:'],
					imgSrc: [
						`'self'`,
						'data:',
						'blob:',
						'cdn.jsdelivr.net',
						'validator.swagger.io',
						'apollo-server-landing-page.cdn.apollographql.com',
					],
					scriptSrc: [
						`'self'`,
						`https: 'unsafe-inline'`,
						`cdn.jsdelivr.net`,
						`'unsafe-eval'`,
					],
					manifestSrc: [
						`'self'`,
						'apollo-server-landing-page.cdn.apollographql.com',
					],
					frameSrc: [
						`'self'`,
						'sandbox.embed.apollographql.com',
						'explorer.embed.apollographql.com',
					],
					objectSrc: ["'self'"],
				},
			},
		});
}

/**
 * Initiate AdminJS
 */
export async function initiateAdmin(
	appService: AppService,
	config: ConfigService,
	server: any,
	cookie: CookieProps,
) {
	const {
		AdminJS,
		adminRouter,
		getCustomResource,
		Database,
		generalDisplay,
		componentLoader,
		Components,
	} = await import('../admin/index.mjs');

	AdminJS.registerAdapter({
		Resource: getCustomResource(appService),
		Database,
	});

	const admin = new AdminJS({
		resources: [
			Enterprise,
			Faculty,
			Student,
			Employee,
			EventTag,
			Event,
			Notification,
			EventCreator,
		].map((i) => generalDisplay(i)),
		dashboard: { component: Components.Dashboard },
		componentLoader,
	});

	await adminRouter(admin, server, appService, config, cookie);
}

/**
 * Server initiation class
 */
export class InitServerClass implements OnModuleInit {
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {}

	onModuleInit() {
		const adapterInstance: FastifyInstance =
				this.httpAdapterHost.httpAdapter.getInstance(),
			middleware = new AppMiddleware(this.jwt, this.config);

		adapterInstance
			.addHook('preValidation', (req, rep) => middleware.auth(req, rep))
			.addHook('preValidation', (req, rep) => middleware.graphQl(req, rep))
			.addHook(
				'preSerialization',
				async (request, reply, payload: UserRecieve) =>
					middleware.cookie(request, reply, payload),
			)
			.addContentTypeParser(
				/^multipart\/([\w-]+);?/,
				function (request, payload, done) {
					request.isMultipart = true;

					done(null, request.body);
				},
			);
	}
}
