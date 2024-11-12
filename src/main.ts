import { existsSync, mkdirSync, readFileSync } from 'fs';
import http from 'http';
import https from 'https';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { config as awsCfg } from 'aws-sdk';
import cookieParser from 'cookie-parser';
import express from 'express';
import { MainModule } from './main.module';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Faculty } from 'university/faculty/faculty.entity';
import { Student } from 'university/student/student.entity';
import { AppService } from 'app/app.service';
import { BaseEntity } from 'typeorm';
import { BaseUser } from 'app/app.entity';

async function bootstrap() {
	const httpsPemFolder = './secrets',
		{ AdminJS, BaseRecord } = await import('adminjs'),
		{ buildAuthenticatedRouter } = await import('@adminjs/express'),
		{ Database, Resource } = await import('@adminjs/typeorm'),
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
		cfgSvc = app.get(ConfigService),
		appSvc = app.get(AppService);

	class CustomResource extends Resource {
		private resourceName: string;

		constructor(model: typeof BaseEntity) {
			super(model);

			this.resourceName = model.name.toLowerCase();
		}

		async findOne(id: string) {
			const instance = await appSvc[this.resourceName].id(id);

			if (!instance) {
				return null;
			}
			return new BaseRecord(instance, this);
		}
	}

	AdminJS.registerAdapter({ Resource: CustomResource, Database });
	mkdirSync(cfgSvc.get('SERVER_PUBLIC'), { recursive: true });
	const admin = new AdminJS({
			resources: [Enterprise, Faculty, Student, BaseUser],
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
