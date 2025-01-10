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
import { AWSService } from 'app/aws/aws.service';

/**
 * @ignore
 */
const virtual_aws = new Map<string, Buffer>();

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
				upload: jest.fn(async (name: string, input: Buffer) =>
					virtual_aws.set(name, input),
				),
				download: jest.fn(async (name: string) => virtual_aws.get(name)),
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
