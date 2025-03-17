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
import { createServer, Server } from 'http';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import fastifyStatic from '@fastify/static';
import { passwordHashing } from 'app/utils/auth.utils';

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
					origin:
						process.env.NODE_ENV != 'production' ||
						process.argv.some((i) => i == '--disable-CORS')
							? '*'
							: /^(https:\/\/){1}(.*)(anhvietnguyen.id.vn){1}$/,
					methods: '*',
					credentials: true,
				},
			},
		),
		{ httpAdapter } = nest.get(HttpAdapterHost),
		config = nest.get(ConfigService),
		cookie: CookieProps = {
			name: config.get('SERVER_SECRET'),
			password: (
				await passwordHashing(config.get('SERVER_SECRET'), {
					hashLength: 6,
					timeCost: 2,
					memoryCost: 6262,
					parallelism: 2,
				})
			).redudeArgon2,
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

	const docConfig = new DocumentBuilder()
			.setTitle('Project W APIs')
			.setDescription('List of APIs available on server')
			.setContact(
				'Anh "Takahashi" Nguyễn',
				'https://anhvietnguyen.id.vn',
				'vietuk.nguyen.git@icloud.com',
			)
			.build(),
		documentFactory = () => SwaggerModule.createDocument(nest, docConfig);
	SwaggerModule.setup('api', nest, documentFactory);

	if (!process.argv.some((i) => i == '--no-csrf'))
		fastify.addHook('preValidation', (req, reply, done) => {
			if (req.method.toLowerCase() !== 'get')
				fastify.csrfProtection(req, reply, done);
			else done();
		});

	fastify
		.register(fastifyStatic, {
			prefix: '/docs',
			root: join(__dirname, '..', 'app/docs'),
			redirect: true,
		})
		.register(
			(childContext, _, done) => {
				childContext.register(fastifyStatic, {
					root: join(__dirname, '..', 'app/page'),
					wildcard: false,
				});
				childContext.setNotFoundHandler((_, reply) =>
					reply.code(404).type('text/html').sendFile('index.html'),
				);
				done();
			},
			{ prefix: '/', decorateReply: false },
		)
		.ready(() => {
			server.listen(process.env.PORT || config.get<string>('SERVER_PORT'));
		});
}

void bootstrap();
