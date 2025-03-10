import { join } from 'path';
import { ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { loadEnv } from 'app/module/config.module';
import { PostgresModule, SqliteModule } from 'app/module/sql.module';
import { AppModule } from 'app/app.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD, HttpAdapterHost } from '@nestjs/core';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Cache, CacheModule } from '@nestjs/cache-manager';
import { InitServerClass } from 'app/utils/server.utils';
import KeyvRedis from '@keyv/redis';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
	imports: [
		// Mail
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfgSvc: ConfigService): MailerOptions => {
				return {
					transport: {
						host: 'smtp.gmail.com',
						secure: true,
						auth: {
							user: cfgSvc.get('SMTP_USER'),
							pass: cfgSvc.get('SMTP_PASS'),
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
			throttlers: [{ limit: 2, ttl: 1000 }],
			errorMessage: 'Invalid_Request',
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
					// Init Apollo SandBox
					playground: false,
					plugins: [
						ApolloServerPluginLandingPageProductionDefault({
							embed: true,
							graphRef: 'ProjectW@current',
						}),
					],
					includeStacktraceInErrorResponses: false,
					inheritResolversFromInterfaces: false,
					introspection: true,
					// Caching
					cache: {
						get: (key: string) => cacheManager.get(key),
						set: (key: string, value: unknown, options: { ttl: number }) =>
							cacheManager.set(key, value, options.ttl.s2ms) as Promise<void>,
						delete: (key: string) => cacheManager.del(key),
					},
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
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
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
