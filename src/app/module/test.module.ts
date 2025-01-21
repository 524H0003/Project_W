/* eslint-disable tsPlugin/require-await */
import { ApolloDriver } from '@nestjs/apollo';
import { Global, MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { loadEnv } from './config.module';
import { JwtModule } from '@nestjs/jwt';
import { SignService } from 'auth/auth.service';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { AWSRecieve, AWSService } from 'app/aws/aws.service';
import { createReadStream, statSync, writeFileSync } from 'fs';
import { lookup } from 'mime-types';
import { Readable } from 'stream';

export const rootPublic = 'public/';

function stream2buffer(stream: Readable) {
	return new Promise<Buffer>((resolve, reject) => {
		const _buf = [];

		stream.on('data', (chunk) => _buf.push(chunk));
		stream.on('end', () => resolve(Buffer.concat(_buf)));
		stream.on('error', (err) => reject(err));
	});
}

@Global()
@Module({
	imports: [
		GraphQLModule.forRoot({
			driver: ApolloDriver,
			autoSchemaFile: 'src/schema.gql',
			sortSchema: true,
			playground: false,
		}),
		CacheModule.register({ isGlobal: true, ttl: 0 }),
		JwtModule.register({ global: true }),
		loadEnv,
		SqlModule('test'),
	],
	providers: [
		SignService,
		{ provide: MailerService, useValue: { sendMail: jest.fn() } },
		{
			provide: AWSService,
			useValue: {
				upload: jest.fn(async (name: string, input: Readable) =>
					writeFileSync(rootPublic + name, await stream2buffer(input)),
				),
				download: jest.fn(async (name: string): Promise<AWSRecieve> => {
					const stream = createReadStream(rootPublic + name),
						length = statSync(rootPublic + name).size;

					return { stream, length, type: lookup(name) as string };
				}),
			},
		},
	],
	exports: [MailerService, AWSService],
})
export class TestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
