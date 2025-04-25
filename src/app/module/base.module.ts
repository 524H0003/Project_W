import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import {
	ApolloFederationDriver,
	ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Cache, CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { GraphQLModule, Int } from '@nestjs/graphql';
import {
	DirectiveLocation,
	GraphQLBoolean,
	GraphQLDirective,
	GraphQLEnumType,
} from 'graphql';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DateTimeScalar, ModifiedCacheInterceptor } from 'app/app.fix';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Keyv from 'keyv';
import { Cacheable } from 'cacheable';
import { createKeyv as createRedisKeyv } from '@keyv/redis';
import { KeyvSqlite } from '@keyv/sqlite';
import { JwtModule } from '@nestjs/jwt';

@Module({
	imports: [
		// JSONWebToken module
		JwtModule.register({ global: true }),
		// Request caching
		CacheModule.registerAsync({
			imports: [ConfigModule],
			useFactory: (config: ConfigService) => ({
				stores: [
					new Keyv({
						store: new Cacheable({
							primary: createRedisKeyv({ url: config.get('REDIS_URL') }),
							secondary: new Keyv({
								store: new KeyvSqlite('sqlite://cache.sqlite'),
								useKeyPrefix: false,
							}),
							ttl: (10).m2s.s2ms,
							namespace: 'Cache0',
							nonBlocking: true,
						}),
					}),
				],
			}),
			inject: [ConfigService],
			isGlobal: true,
		}),
		// GraphQL and Apollo SandBox
		GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
			driver: ApolloFederationDriver,
			inject: [CACHE_MANAGER],
			useFactory: (cacheManager: Cache) => {
				return {
					// Code first
					autoSchemaFile: { path: 'src/schema.gql', federation: 2 },
					sortSchema: true,
					// Init sandBox
					playground: false,
					includeStacktraceInErrorResponses: false,
					inheritResolversFromInterfaces: false,
					introspection: true,
					// Caching
					cache: {
						get: async (key: string): Promise<string> => {
							const result = await cacheManager.get<string>(key);

							if (!result) return undefined;

							return result;
						},
						set: (key: string, value: unknown, options: { ttl: number }) =>
							cacheManager.set(key, value, options.ttl.s2ms) as Promise<void>,
						delete: (key: string) => cacheManager.del(key),
					},
					// Fix request context
					context: (...args: any[]) => ({ req: args[0], res: args[1] }),
					// Plugins
					plugins: [
						responseCachePlugin({
							sessionId: async (requestContext) =>
								(await requestContext.request.http.headers.get('sessionId')) ||
								null,
						}),
						ApolloServerPluginCacheControl({ defaultMaxAge: (3).m2s }),
					],
					// Schema build options
					buildSchemaOptions: {
						directives: [
							new GraphQLDirective({
								name: 'cacheControl',
								args: {
									maxAge: { type: Int },
									scope: {
										type: new GraphQLEnumType({
											name: 'CacheControlScope',
											values: { PUBLIC: {}, PRIVATE: {} },
										}),
									},
									inheritMaxAge: { type: GraphQLBoolean },
								},
								locations: [
									DirectiveLocation.FIELD_DEFINITION,
									DirectiveLocation.OBJECT,
									DirectiveLocation.INTERFACE,
									DirectiveLocation.UNION,
									DirectiveLocation.QUERY,
								],
							}),
						],
					},
				};
			},
		}),
	],
	providers: [
		{ provide: APP_INTERCEPTOR, useClass: ModifiedCacheInterceptor },
		DateTimeScalar,
	],
})
export class BaseModule {}
