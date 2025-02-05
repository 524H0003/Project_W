import { mkdirSync } from 'fs';
import { ValidationPipe, VersioningType } from '@nestjs/common';
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
	fastifyOptions,
	initiateAdmin,
	registerServerPlugins,
} from 'app/utils/server.utils';
import Fastify from 'fastify';
import { hash } from 'app/utils/auth.utils';
import { createServer, Server } from 'http';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
	let server: Server;

	const fastify = Fastify({
			...fastifyOptions,
			serverFactory: (handle) =>
				(server = createServer((req, res) => handle(req, res))),
		}),
		nest = await NestFactory.create<NestFastifyApplication>(
			MainModule,
			new FastifyAdapter(fastify),
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

	await registerServerPlugins(fastify, cookie);
	await initiateAdmin(nest.get(AppService), config, fastify, cookie);

	mkdirSync(config.get('SERVER_PUBLIC'), { recursive: true });

	await nest
		.setGlobalPrefix('api')
		.useGlobalPipes(new ValidationPipe())
		.useGlobalFilters(new AppExceptionFilter(httpAdapter))
		.enableVersioning({ type: VersioningType.URI })
		.init();

	const docConfig = new DocumentBuilder().setTitle('Project W APIs').build(),
		documentFactory = () => SwaggerModule.createDocument(nest, docConfig);
	SwaggerModule.setup('api', nest, documentFactory);

	if (process.argv.length == 3 && process.argv[2] != 'no-csrf')
		fastify.addHook('preValidation', (req, reply, done) => {
			if (req.method.toLowerCase() !== 'get')
				fastify.csrfProtection(req, reply, done);
			else done();
		});

	fastify.ready(() => {
		server.listen(process.env.PORT || config.get<string>('SERVER_PORT'));
	});
}

void bootstrap();
