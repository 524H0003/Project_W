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
import { HttpException, HttpStatus } from '@nestjs/common';
import pc from 'picocolors';
import { Colors } from 'picocolors/types';
import { ErrorType, ErrorObject, ErrorAction } from './utils';

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
			secure: true,
			sameSite: 'strict',
		};

	await fastify
		.register(fastifyCompression, {
			encodings: ['gzip', 'deflate'],
			brotliOptions: { params: { [constants.BROTLI_PARAM_QUALITY]: 6 } },
		})
		.register(fastifySecuredSession, {
			cookieName: 'session',
			cookie: { ...cookieOptions, signed: true },
			secret,
			key: readFileSync('securedSessionKey'),
			salt: (256).string,
		})
		.register(fastifyCsrf, {
			sessionKey: name,
			cookieKey: 'csrf',
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
			.addHook('preValidation', (req, rep, done) =>
				middleware.auth(req, rep, done),
			)
			.addHook('preValidation', (req, rep) => middleware.graphQl(req, rep))
			.addHook('preSerialization', (req, rep, payload: UserRecieve, done) =>
				middleware.cookie(req, rep, payload, done),
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

declare global {
	/**
	 * Server exception class
	 */
	class ServerException extends HttpException {
		constructor(
			type: ErrorType,
			object: ErrorObject,
			action: ErrorAction,
			err?: any,
		);
	}
}

const color = (args: ColorLogOptions) =>
		(args.bg ? pc['bg' + args.bg.capitalize] : String)(
			(args.font ? pc[args.font] : String)(args.msg),
		),
	errorStatus = (error: any) =>
		error instanceof HttpException
			? error.getStatus()
			: HttpStatus.INTERNAL_SERVER_ERROR;

/**
 * Server exception class
 */
class ServerException extends HttpException {
	constructor(
		type: ErrorType,
		object: ErrorObject,
		action: ErrorAction,
		private err: ErrorExtender = new Error() as ErrorExtender,
	) {
		super(
			(6).string + '_' + type + '_' + object + (action ? '_' : '') + action,
			+(err.statusCode || 400),
		);
	}

	terminalLogging() {
		const { cause, message, stack, statusCode } = this.err,
			title = `${'-'.repeat(6)}${this.message}-${statusCode || 400}${'-'.repeat(6)}`;

		console.error(
			color({ bg: 'red', msg: title }) +
				'\n' +
				color({
					font: 'yellow',
					msg: `\tCause: ${cause || 'unknown'}\n\tMessage: ${message || 'N/A'}\n\tStack: ${stack}`,
				}) +
				'\n' +
				color({ bg: 'red', msg: '-'.repeat(title.length) }),
		);
	}
}

/**
 * Colored logging options
 */
interface ColorLogOptions {
	msg: string;
	bg?: keyof KeepBgKeys<Colors> | '';
	font?: keyof Omit<RemoveBgKeys<Colors>, 'isColorSupported'> | '';
}

/**
 * Server error extender
 */
type ErrorExtender = Error & { statusCode: string | number };

/**
 * Removing properties have prefix bg
 */
type RemoveBgKeys<T> = {
	// eslint-disable-next-line tsEslint/no-unused-vars
	[K in keyof T as K extends `bg${infer _}` ? never : K]: T[K];
};

/**
 * Keep properties have prefix bg
 */
type KeepBgKeys<T> = {
	[K in keyof T as K extends `bg${infer Rest}`
		? Uncapitalize<Rest>
		: never]: T[K];
};

/**
 * Assign server functions
 */
Object.assign(global, { ServerException, color, errorStatus });
