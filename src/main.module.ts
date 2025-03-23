import { join } from 'path';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { loadEnv } from 'app/module/config.module';
import { PostgresModule, SqliteModule } from 'app/module/sql.module';
import { AppModule } from 'app/app.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { CacheModule } from '@nestjs/cache-manager';
import { InitServerClass } from 'app/utils/server.utils';
import { createKeyv } from '@keyv/redis';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import {
	DateTimeScalar,
	ModifiedCacheInterceptor,
	ModifiedThrottlerGuard,
} from 'app/app.fix';
import { Cacheable } from 'cacheable';
import Keyv from 'keyv';

@Module({
	imports: [
		// Mail
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): MailerOptions => {
				return {
					transport: process.argv.some((i) => i == '--test-email')
						? { secure: false, host: 'localhost', port: 7777 }
						: {
								host: 'smtp.gmail.com',
								secure: true,
								auth: {
									user: config.get('SMTP_USER'),
									pass: config.get('SMTP_PASS'),
								},
							},
					defaults: { from: '"Unreal mail" <secret@student.tdtu.edu.vn>' },
					template: {
						dir: join(__dirname, '../app/mail/templates'),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
		}),
		// Api rate limit
		ThrottlerModule.forRoot({
			throttlers: [{ limit: 2, ttl: 1000, name: 'defaultThrottler' }],
			errorMessage: new ServerException('Fatal', 'User', 'Request').message,
		}),
		// GraphQL and Apollo SandBox
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			// Avoid deprecated
			subscriptions: {
				'graphql-ws': true,
				'subscriptions-transport-ws': false,
			},
			// Code first
			autoSchemaFile: 'src/schema.gql',
			sortSchema: true,
			// Init sandBox
			playground: false,
			plugins: [],
			includeStacktraceInErrorResponses: true,
			inheritResolversFromInterfaces: false,
			introspection: true,
			// Fix request context
			context: (...args: any[]) => ({ req: args[0], res: args[1] }),
		}),
		// Core modules
		loadEnv,
		PostgresModule('deploy'),
		SqliteModule('deploy'),
		// Application modules
		AppModule,
		// Schedule mmodule
		ScheduleModule.forRoot(),
		// Request caching
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				stores: [
					new Keyv({
						store: new Cacheable({
							primary: createKeyv({
								url: config.get('REDIS_URL'),
								name: 'cache',
							}),
							ttl: (180).s2ms,
						}),
					}),
				],
			}),
			inject: [ConfigService],
			isGlobal: true,
		}),
	],
	providers: [
		{ provide: APP_GUARD, useClass: ModifiedThrottlerGuard },
		{ provide: APP_INTERCEPTOR, useClass: ModifiedCacheInterceptor },
		DateTimeScalar,
	],
})
export class MainModule extends InitServerClass {
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {
		super(httpAdapterHost, config, jwt);
	}
}
