import { join } from 'path';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ServeStaticModule } from '@nestjs/serve-static';
import { loadEnv } from 'app/module/config.module';
import { SqlModule } from 'app/module/sql.module';
import { AuthMiddleware } from 'auth/auth.middleware';
import { AppModule } from 'app/app.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { Cache, CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';

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
						dir: join(__dirname, 'app/mail/templates'),
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
			// eslint-disable-next-line @typescript-eslint/require-await
			useFactory: async (cacheManager: Cache) => {
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
					plugins: [ApolloServerPluginLandingPageLocalDefault()],
					includeStacktraceInErrorResponses: false,
					inheritResolversFromInterfaces: false,
					// Caching
					cache: {
						get: (key) => cacheManager.get(key),
						set: (key, value, options) =>
							cacheManager.set(key, value, options.ttl.s2ms),
						delete: (key) => cacheManager.del(key),
					},
				};
			},
		}),
		// Core modules
		loadEnv,
		SqlModule('deploy'),
		// Application modules
		AppModule,
		// Serving static pages
		ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'page/dist') }),
		// Request caching
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: async (cfg: ConfigService) => {
				let store = undefined;

				try {
					store = await redisStore({
						socket: {
							host: cfg.get('REDIS_HOST'),
							port: cfg.get('REDIS_PORT'),
						},
						username: cfg.get('REDIS_USER'),
						password: cfg.get('REDIS_PASS'),
					});
				} catch (error) {
					console.error(
						'-'.repeat(30),
						'\nFailed too implement redis cache\n',
						'-'.repeat(30),
					);
				}

				return { store, ttl: (3).s2ms };
			},
		}),
	],
	providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class MainModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(AuthMiddleware).forRoutes('/');
	}
}
