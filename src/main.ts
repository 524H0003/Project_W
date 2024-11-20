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
import { Employee } from 'enterprise/employee/employee.entity';
import { EventTag } from 'event/tag/tag.entity';
import { Notification } from 'notification/notification.entity';
import { Event } from 'event/event.entity';
import { EventCreator } from 'event/creator/creator.entity';

async function bootstrap() {
	const httpsPemFolder = './secrets',
		{ AdminJS, BaseRecord, flat } = await import('adminjs'),
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

		isNumeric(value: any) {
			const stringValue = String(value).replace(/,/g, '.');
			if (isNaN(parseFloat(stringValue))) return false;
			return isFinite(Number(stringValue));
		}

		safeParseNumber(value: any) {
			if (this.isNumeric(value)) return Number(value);
			return value;
		}

		/** Converts params from string to final type */
		private customPrepareParams(params: {}) {
			const preparedParams = { ...params };
			this.properties().forEach((property) => {
				const param = flat.get(preparedParams, property.path());
				const key = property.path();
				// eslint-disable-next-line no-continue
				if (param === undefined) {
					return;
				}
				const type = property.type();
				if (type === 'mixed') {
					preparedParams[key] = param;
				}
				if (type === 'number') {
					if (property.isArray()) {
						preparedParams[key] = param
							? param.map((p) => this.safeParseNumber(p))
							: param;
					} else {
						preparedParams[key] = this.safeParseNumber(param);
					}
				}
				if (type === 'reference') {
					if (param === null) {
						preparedParams[property.column.propertyName] = null;
					} else {
						const [ref, foreignKey] = property.column.propertyPath.split('.');
						const id = property.column.type === Number ? Number(param) : param;
						preparedParams[ref] = foreignKey
							? {
									[foreignKey]: id,
								}
							: id;
					}
				}
			});
			return preparedParams;
		}

		async findOne(id: string) {
			const instance = await appSvc[this.resourceName].id(id);

			if (!instance) return null;

			return new BaseRecord(instance, this);
		}

		async update(id: string, params = {}) {
			const instance = await appSvc[this.resourceName].id(id, { deep: 0 });

			if (!instance) throw new Error('Instance not found.');

			const preparedParams = flat.unflatten(this.customPrepareParams(params));
			Object.keys(preparedParams).forEach((paramName) => {
				if (typeof instance[paramName] !== 'undefined')
					instance[paramName] = preparedParams[paramName];
			});

			return appSvc[this.resourceName].modify(id, instance);
		}

		delete(id: string) {
			return appSvc[this.resourceName].remove(id);
		}
	}

	AdminJS.registerAdapter({ Resource: CustomResource, Database });
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
			],
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
