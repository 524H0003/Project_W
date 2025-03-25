/* eslint-disable tsEslint/require-await */
import { Global, Module } from '@nestjs/common';
import { GraphQLModule, Int } from '@nestjs/graphql';
import { PostgresModule, SqliteModule } from 'app/module/sql.module';
import { loadEnv } from './config.module';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Cache, CacheInterceptor, CacheModule } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { AWSRecieve, AWSService } from 'app/aws/aws.service';
import {
	createReadStream,
	createWriteStream,
	statSync,
	writeFileSync,
} from 'fs';
import { lookup } from 'mime-types';
import { Readable } from 'stream';
import { InitServerClass } from 'app/utils/server.utils';
import { APP_INTERCEPTOR, HttpAdapterHost } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
	ApolloFederationDriver,
	ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginCacheControl } from '@apollo/server/plugin/cacheControl';
import responseCachePlugin from '@apollo/server-plugin-response-cache';
import {
	DirectiveLocation,
	GraphQLBoolean,
	GraphQLDirective,
	GraphQLEnumType,
} from 'graphql';
import Keyv from 'keyv';
import { Cacheable } from 'cacheable';
import { createKeyv } from '@keyv/redis';

/**
 * Server public path
 */
export const rootPublic = process.env.SERVER_PUBLIC || 'public/';

@Global()
@Module({
	imports: [
		GraphQLModule.forRootAsync<ApolloFederationDriverConfig>({
			driver: ApolloFederationDriver,
			inject: ['CACHE_MANAGER'],
			useFactory: (cacheManager: Cache) => {
				return {
					// Code first
					autoSchemaFile: { path: 'src/schema.gql', federation: 2 },
					sortSchema: true,
					// Init sandBox
					playground: false,
					includeStacktraceInErrorResponses: true,
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
					plugins: [responseCachePlugin(), ApolloServerPluginCacheControl()],
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
		JwtModule.register({ global: true }),
		loadEnv,
		PostgresModule('test'),
		SqliteModule('test'),
	],
	providers: [
		{ provide: MailerService, useValue: { sendMail: jest.fn() } },
		{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor },
		{
			provide: AWSService,
			useValue: {
				upload: jest.fn(async (name: string, input: Readable | Buffer) => {
					if (!name.includes('.server.'))
						if (input instanceof Readable) {
							const writableStream = createWriteStream(rootPublic + name);
							input.pipe(writableStream);
						} else writeFileSync(rootPublic + name, input);
				}),
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
export class TestModule extends InitServerClass {
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {
		super(httpAdapterHost, config, jwt);
	}
}
