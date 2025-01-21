import { existsSync, mkdirSync, readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { config as awsCfg } from 'aws-sdk';
import cookieParser from 'cookie-parser';
import express from 'express';
import { MainModule } from './main.module';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { AppService } from 'app/app.service';
import { Employee } from 'enterprise/employee/employee.entity';
import { EventTag } from 'event/tag/tag.entity';
import { Notification } from 'notification/notification.entity';
import { Event } from 'event/event.entity';
import { getAdminJS } from 'app/utils/adminjs.utils';
import { EventCreator } from 'event/creator/creator.entity';
import { AppExceptionFilter } from 'app/app.filter';
import { graphqlUploadExpress } from 'graphql-upload-ts';

async function bootstrap() {
	const httpsPemFolder = './secrets',
		server = express(),
		app = (
			await NestFactory.create(MainModule, new ExpressAdapter(server), {
				cors: {
					// origin: /(https:\/\/){1}(.*)(anhvietnguyen.id.vn){1}/,
					origin: '*',
					// /^(https:\/\/){1}(((.*)(anhvietnguyen.id.vn){1}){1}|(localhost){1}:([0-9]){1,4})/,
					methods: '*',
					credentials: true,
				},
			})
		)
			.use(cookieParser())
			.useGlobalPipes(new ValidationPipe()),
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
		} = await getAdminJS(appSvc);

	AdminJS.registerAdapter({ Resource: getCustomResource(), Database });
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
				cookiePassword: 'sessionsecret',
			},
			null,
			{ resave: false, saveUninitialized: false },
		);
	awsCfg.update({
		accessKeyId: cfgSvc.get('AWS_ACCESS_KEY_ID'),
		secretAccessKey: cfgSvc.get('AWS_SECRET_ACCESS_KEY'),
		useFipsEndpoint: cfgSvc.get('AWS_ENDPOINT'),
		region: cfgSvc.get('AWS_REGION'),
	});

	await app
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.use(admin.options.rootPath, adminRouter)
		.use('/graphql', graphqlUploadExpress({ maxFileSize: (50).mb2b }))
		.setGlobalPrefix('api/v1')
		.init();
	http
		.createServer(server)
		.listen(process.env.PORT || cfgSvc.get('SERVER_PORT'));

	try {
		if (existsSync(httpsPemFolder)) {
			https
				.createServer(
					{
						key: readFileSync(`${httpsPemFolder}/key.pem`),
						cert: readFileSync(`${httpsPemFolder}/cert.pem`),
					},
					server,
				)
				.listen(2053);
		}
	} catch {
		console.warn('Https connection not initialize');
	}
}

void bootstrap();
