import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCookie from '@fastify/cookie';
import fastifySession, { CookieOptions } from '@fastify/session';
import { MainModule } from './main.module';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { AppService } from 'app/app.service';
import { Employee } from 'enterprise/employee/employee.entity';
import { EventTag } from 'event/tag/tag.entity';
import { Notification } from 'notification/notification.entity';
import { Event } from 'event/event.entity';
import { EventCreator } from 'event/creator/creator.entity';
import { AppExceptionFilter } from 'app/app.filter';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import fastifyHelmet from '@fastify/helmet';
import Fastify, { FastifyInstance } from 'fastify';
import { hash } from 'app/utils/auth.utils';
import { User } from 'user/user.entity';
import { Hook } from 'app/hook/hook.entity';
import { fastifyFormbody } from '@fastify/formbody';
import { IRefreshResult } from 'auth/strategies/refresh.strategy';

declare module 'fastify' {
	interface FastifyRequest {
		user: User;
		hook: Hook;
		refresh: IRefreshResult;
		token: object;
	}

	interface Session {
		redirectTo: string;
	}
}

type CookieProps = {
	name: string;
	password: string;
};

async function registerServerPlugins(
	fastify: FastifyInstance,
	{ password, name }: CookieProps,
) {
	const secret = password,
		cookieOptions: CookieOptions = {
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
		};

	await fastify
		.register(fastifyFormbody)
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
		})
		.register(fastifyCookie, {
			secret,
			parseOptions: cookieOptions,
		})
		.register(fastifySession, {
			secret,
			// ! Cautious: Session's cookie secure must set false. If not, AdminJS crash
			cookie: { secure: false },
			cookieName: name,
		});
}

async function initiateAdmin(
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
	} = await import('./app/admin/index.mjs');

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

async function bootstrap() {
	const server = Fastify(),
		module = process.argv.find((i) => i.startsWith('--test')),
		nest = await NestFactory.create<NestFastifyApplication>(
			MainModule,
			new FastifyAdapter(server),
			{
				cors: {
					// origin: /(https:\/\/){1}(.*)(anhvietnguyen.id.vn){1}/,
					origin: '*',
					// /^(https:\/\/){1}(((.*)(anhvietnguyen.id.vn){1}){1}|(localhost){1}:([0-9]){1,4})/,
					methods: '*',
					credentials: true,
				},
			},
		),
		{ httpAdapter } = nest.get(HttpAdapterHost),
		config = nest.get(ConfigService),
		cookie: CookieProps = {
			name: (6).string,
			password: await hash(config.get('SERVER_SECRET')),
		};

	await registerServerPlugins(server, cookie);
	await initiateAdmin(nest.get(AppService), config, server, cookie);

	if (module) console.error('asdpfhiap');

	mkdirSync(config.get('SERVER_PUBLIC'), { recursive: true });

	await nest
		.use('/graphql', graphqlUploadExpress({ maxFileSize: (50).mb2b }))
		.setGlobalPrefix('api/v1')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.listen(process.env.PORT || config.get<number>('SERVER_PORT'));
}

void bootstrap();
