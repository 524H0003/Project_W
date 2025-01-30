import { existsSync, mkdirSync, readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cookieParser from 'cookie-parser';
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

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
			MainModule,
			new FastifyAdapter(),
		),
		{ httpAdapter } = app.get(HttpAdapterHost),
		cfgSvc = app.get(ConfigService),
		appSvc = app.get(AppService),
		{
			AdminJS,
			buildAuthenticatedRouter,
			getCustomResource,
			Database,
			generalDisplay,
			componentLoader,
			Components,
		} = await import('./app/admin/index.mjs');

	AdminJS.registerAdapter({ Resource: getCustomResource(appSvc), Database });
	mkdirSync(cfgSvc.get('SERVER_PUBLIC'), { recursive: true });
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
					const hook = await appSvc.hook.findOne({ signature: password });

					if (!hook || email !== cfgSvc.get('ADMIN_EMAIL')) return null;

					return { email, password };
				},
				cookieName: 'adminjs',
				cookiePassword: cfgSvc.get('SERVER_SECRET'),
			},
			null,
			{ resave: false, saveUninitialized: false },
		);

	await app
		.use(cookieParser())
		.use(admin.options.rootPath, adminRouter)
		.use('/graphql', graphqlUploadExpress({ maxFileSize: (50).mb2b }))
		.setGlobalPrefix('api/v1')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.listen(cfgSvc.get('SERVER_PORT'));
	await app.register(helmet, {
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
	app.enableCors({
		// origin: /(https:\/\/){1}(.*)(anhvietnguyen.id.vn){1}/,
		origin: '*',
		// /^(https:\/\/){1}(((.*)(anhvietnguyen.id.vn){1}){1}|(localhost){1}:([0-9]){1,4})/,
		methods: '*',
		credentials: true,
	});
}

void bootstrap();
