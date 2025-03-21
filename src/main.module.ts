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
import { Cache, CacheModule } from '@nestjs/cache-manager';
import { InitServerClass } from 'app/utils/server.utils';
import KeyvRedis from '@keyv/redis';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ModifiedCacheInterceptor, ModifiedThrottlerGuard } from 'app/app.fix';

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
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				throttlers: [{ limit: 2, ttl: 1000 }],
				errorMessage: new ServerException('Fatal', 'User', 'Request').message,
				storage: new ThrottlerStorageRedisService({
					username: config.get('REDIS_USER'),
					password: config.get('REDIS_PASS'),
					host: config.get('REDIS_HOST'),
					port: config.get('REDIS_PORT'),
				}),
			}),
		}),
		// GraphQL and Apollo SandBox
		GraphQLModule.forRootAsync<ApolloDriverConfig>({
			driver: ApolloDriver,
			inject: ['CACHE_MANAGER'],
			useFactory: (cacheManager: Cache) => {
				return {
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
					// Caching
					cache: {
						get: (key: string) => cacheManager.get(key),
						set: (key: string, value: unknown, options: { ttl: number }) =>
							cacheManager.set(key, value, options.ttl.s2ms) as Promise<void>,
						delete: (key: string) => cacheManager.del(key),
					},
					// Fix request context
					context: (...args: any[]) => ({ req: args[0], res: args[1] }),
				};
			},
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
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfg: ConfigService) => {
				let store = undefined;

				try {
					store = new KeyvRedis({
						socket: {
							host: cfg.get('REDIS_HOST'),
							port: cfg.get('REDIS_PORT'),
						},
						username: cfg.get('REDIS_USER'),
						password: cfg.get('REDIS_PASS'),
					});
				} catch (error) {
					throw new ServerException(
						'Fatal',
						'Redis',
						'Implementation',
						error as Error,
					);
				}

				return { store, ttl: (180).s2ms };
			},
		}),
	],
	providers: [
		{ provide: APP_GUARD, useClass: ModifiedThrottlerGuard },
		{ provide: APP_INTERCEPTOR, useClass: ModifiedCacheInterceptor },
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
