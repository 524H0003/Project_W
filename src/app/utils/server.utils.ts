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
import {
	FastifyInstance,
	FastifyReply,
	FastifyRequest,
	FastifyServerOptions,
} from 'fastify';
import { User } from 'user/user.entity';
import { Hook } from 'app/hook/hook.entity';
import { IRefreshResult } from 'auth/guards/refresh.strategy';
import { ConfigService } from '@nestjs/config';
import { AppService } from 'app/app.service';
import { OnModuleInit } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { SignService } from 'auth/auth.service';
import { AuthMiddleware } from 'auth/auth.middleware';
import fastifyCsrf, { CookieSerializeOptions } from '@fastify/csrf-protection';
import fastifySecuredSession from '@fastify/secure-session';
import { readFileSync } from 'fs';

declare module 'fastify' {
	interface FastifyRequest {
		user: User;
		hook: Hook;
		refresh: IRefreshResult;
	}

	interface Session {
		redirectTo: string;
	}
}

export const fastifyOptions: FastifyServerOptions = { maxParamLength: 128 };

export type CookieProps = { name: string; password: string };

export async function registerServerPlugins(
	fastify: FastifyInstance,
	{ password = (32).string, name = (6).string }: Partial<CookieProps>,
) {
	const secret = password,
		cookieOptions: CookieSerializeOptions = {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
		};

	await fastify
		.register(fastifySecuredSession, {
			cookieName: (6).string,
			cookie: { ...cookieOptions, signed: true },
			secret,
			key: readFileSync('securedSessionKey'),
			salt: (256).string,
		})
		.register(fastifyCsrf, {
			sessionKey: name,
			cookieKey: (6).string,
			cookieOpts: cookieOptions,
			sessionPlugin: '@fastify/secure-session',
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
					imgSrc: [`'self'`, 'data:', 'cdn.jsdelivr.net'],
					scriptSrc: [
						`'self'`,
						`https: 'unsafe-inline'`,
						`cdn.jsdelivr.net`,
						`'unsafe-eval'`,
					],
				},
			},
		});
}

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

export class InitServerClass implements OnModuleInit {
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected configService: ConfigService,
		protected signService: SignService,
	) {}

	onModuleInit() {
		const adapterInstance: FastifyInstance =
				this.httpAdapterHost.httpAdapter.getInstance(),
			authMiddleware = new AuthMiddleware(this.configService, this.signService);

		adapterInstance
			.addHook(
				'preValidation',
				(request: FastifyRequest, response: FastifyReply) =>
					authMiddleware.use(request, response),
			)
			// .addHook('onRequest', (req, reply, done) => {
			// 	if (req.method.toLowerCase() !== 'get')
			// 		adapterInstance.csrfProtection(req, reply, done);
			// 	done();
			// })
			.addContentTypeParser(
				/^multipart\/([\w-]+);?/,
				function (request, payload, done) {
					request['isMultipart'] = true;

					done(null, request.body);
				},
			);
	}
}
