import { existsSync, mkdirSync, readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { config as awsCfg } from 'aws-sdk';
import cookieParser from 'cookie-parser';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Event, EventCreator } from 'event/event.entity';
import express from 'express';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { AppModule } from './app.module';
import { Device } from './auth/device/device.entity';
import { User } from './user/user.entity';

async function bootstrap() {
	const httpsPemFolder = './secrets',
		{ AdminJS } = await import('adminjs'),
		{ buildAuthenticatedRouter } = await import('@adminjs/express'),
		{ Database, Resource } = await import('@adminjs/typeorm'),
		server = express(),
		app = (
			await NestFactory.create(AppModule, new ExpressAdapter(server), {
				cors: {
					origin:
						/(https:\/\/){1}(.*)(anhvietnguyen.id.vn|localhost\:(\d*)){1}/,
					methods: '*',
					credentials: true,
				},
			})
		)
			.use(cookieParser())
			.useGlobalPipes(new ValidationPipe()),
		cfgSvc = app.get(ConfigService);
	AdminJS.registerAdapter({ Resource, Database });
	mkdirSync(cfgSvc.get('SERVER_PUBLIC'), { recursive: true });
	const admin = new AdminJS({
			resources: [Student],
		}),
		adminRouter = buildAuthenticatedRouter(
			admin,
			{
				authenticate(email, password) {
					return email === cfgSvc.get('ADMIN_EMAIL') &&
						password === cfgSvc.get('ADMIN_PASSWORD')
						? Promise.resolve({ email, password })
						: null;
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

	// Init multiple connection type
	await app
		.use(admin.options.rootPath, adminRouter)
		.setGlobalPrefix('api/v1')
		.init();
	http.createServer(server).listen(cfgSvc.get('SERVER_PORT'));

	if (existsSync(httpsPemFolder))
		https
			.createServer(
				{
					key: readFileSync(`${httpsPemFolder}/key.pem`),
					cert: readFileSync(`${httpsPemFolder}/cert.pem`),
				},
				server,
			)
			.listen(2053);
	else console.warn('Https connection not initialize');
}

void bootstrap();
