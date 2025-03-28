/* eslint-disable tsEslint/no-unused-vars */
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataHashing } from 'app/utils/auth.utils';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TlsOptions } from 'tls';
import { DataSourceOptions, QueryRunner } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';
import { QueryResultCache } from 'typeorm/cache/QueryResultCache.js';
import { QueryResultCacheOptions } from 'typeorm/cache/QueryResultCacheOptions.js';

/**
 * Reading SSL certificate
 * @return {TlsOptions | boolean} found certificate or not using ssl
 */
function readSslCa(): TlsOptions | boolean {
	try {
		return { rejectUnauthorized: false, ca: readFileSync(`./secrets/ca.cert`) };
	} catch {
		return false;
	}
}

/**
 * Sql type
 */
type SqlType = 'deploy' | 'test';

/**
 * Server postgresql configuration
 */
export const postgresConfig = (
	type: SqlType,
	cfgSvc: ConfigService,
): DataSourceOptions => ({
	type: 'postgres',
	host: cfgSvc.get<string>('POSTGRES_HOST'),
	port: cfgSvc.get<number>('POSTGRES_PORT'),
	username: cfgSvc.get<string>('POSTGRES_USER'),
	password: cfgSvc.get<string>('POSTGRES_PASS'),
	database: type === 'deploy' ? cfgSvc.get('POSTGRES_DB') : type,
	synchronize: true,
	ssl: cfgSvc.get('POSTGRES_SSL') ? readSslCa() : false,
});

/**
 * Server postgresql module
 */
export const PostgresModule = (type: SqlType) =>
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService, CACHE_MANAGER],
		useFactory: async (cfgSvc: ConfigService, cache: Cache) => {
			try {
				await createPostgresDatabase({
					options: postgresConfig(type, cfgSvc),
					ifNotExist: true,
				});
			} catch {}
			return {
				...postgresConfig(type, cfgSvc),
				autoLoadEntities: true,
				synchronize: true,
				retryAttempts: type == 'test' ? 0 : 5,
				cache: {
					duration: (1).m2s.s2ms,
					provider() {
						return new CacheManagerProvider(cache);
					},
				},
			};
		},
	});

/**
 * TypeOrm Cache provider from cache manager
 */
export class CacheManagerProvider implements QueryResultCache {
	private keyPrefix: String;

	constructor(private cache: Cache) {
		this.keyPrefix = 'TypeOrm';
	}

	private generateIdentifier(query: string) {
		return dataHashing(query);
	}

	connect(): Promise<void> {
		return;
	}

	disconnect(): Promise<void> {
		return;
	}

	synchronize(queryRunner?: QueryRunner): Promise<void> {
		return;
	}

	async getFromCache(
		options: QueryResultCacheOptions,
		queryRunner?: QueryRunner,
	): Promise<QueryResultCacheOptions | undefined> {
		const { identifier, query, duration } = options;
		const key = `${this.keyPrefix}${identifier || this.generateIdentifier(query)}`;
		const result = await this.cache.get(key);

		return result && { identifier: key, duration, query, result };
	}

	async storeInCache(
		options: QueryResultCacheOptions,
		savedCache: QueryResultCacheOptions | undefined,
		queryRunner?: QueryRunner,
	): Promise<void> {
		const { identifier, query, duration, result } = options;
		const key = `${this.keyPrefix}${identifier || this.generateIdentifier(query)}`;
		await this.cache.set(key, result, duration);
	}

	isExpired(savedCache: QueryResultCacheOptions): boolean {
		return false;
	}

	async clear(queryRunner?: QueryRunner): Promise<void> {
		await this.cache.clear();
	}

	async remove(
		identifiers: string[],
		queryRunner?: QueryRunner,
	): Promise<void> {
		for (const key of identifiers) await this.cache.del(key);
	}
}
