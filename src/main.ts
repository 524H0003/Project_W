import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
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
import helmet from '@fastify/helmet';
import fastify, { FastifyInstance } from 'fastify';
import { hash } from 'app/utils/auth.utils';
import { User } from 'user/user.entity';
import { Hook } from 'app/hook/hook.entity';

declare module 'fastify' {
	interface FastifyRequest {
		user: User;
		hook: Hook;
	}
}

async function registerServerPlugins(
	fastify: FastifyInstance,
	config: ConfigService,
) {
	await fastify
		.register(helmet, {
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
		.register(cookie, {
			secret: await hash(config.get<string>('SERVER_SECRET')),
			parseOptions: { httpOnly: true, secure: true, sameSite: 'lax' },
		});
}

async function initiateAdmin(config: ConfigService, appService: AppService) {
	const {
		AdminJS,
		buildAuthenticatedRouter,
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
		}),
		adminRouter = buildAuthenticatedRouter(
			admin,
			{
				authenticate: async (email, password) => {
					const hook = await appService.hook.findOne({ signature: password });

					if (!hook || email !== config.get('ADMIN_EMAIL')) return null;

					return { email, password };
				},
				cookieName: 'adminjs',
				cookiePassword: config.get('SERVER_SECRET'),
			},
			null,
			{ resave: false, saveUninitialized: false },
		);

	return { adminRouter, adminPath: admin.options.rootPath };
}

async function bootstrap() {
	const server = fastify(),
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
		{ adminPath, adminRouter } = await initiateAdmin(
			config,
			nest.get(AppService),
		);

	mkdirSync(config.get('SERVER_PUBLIC'), { recursive: true });

	await registerServerPlugins(server, config);

	await nest
		.use(adminPath, adminRouter)
		.use('/graphql', graphqlUploadExpress({ maxFileSize: (50).mb2b }))
		.setGlobalPrefix('api/v1')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.init();
}

void bootstrap();
