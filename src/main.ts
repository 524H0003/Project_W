import { mkdirSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import {
	FastifyAdapter,
	NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MainModule } from './main.module';
import { AppService } from 'app/app.service';
import { AppExceptionFilter } from 'app/app.filter';
import {
	CookieProps,
	initiateAdmin,
	registerServerPlugins,
} from 'app/utils/server.utils';
import Fastify from 'fastify';
import { hash } from 'app/utils/auth.utils';

async function bootstrap() {
	const server = Fastify(),
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

	mkdirSync(config.get('SERVER_PUBLIC'), { recursive: true });

	await nest
		.setGlobalPrefix('api/v1')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.listen(process.env.PORT || config.get<number>('SERVER_PORT'));
}

void bootstrap();
