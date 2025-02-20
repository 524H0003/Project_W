import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TlsOptions } from 'tls';
import { DataSourceOptions } from 'typeorm';
import { createPostgresDatabase } from 'typeorm-extension';

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
	cache: true,
});

/**
 * Server postgresql module
 */
export const PostgresModule = (type: SqlType) =>
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: async (cfgSvc: ConfigService) => {
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
			};
		},
	});

/**
 * Server sqlite module
 */
export const SqliteModule = (type: SqlType) =>
	TypeOrmModule.forRootAsync({
		name: 'sqlite_db',
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (config: ConfigService) => ({
			type: 'sqlite',
			database: join(
				__dirname,
				(type === 'deploy' ? config.get<string>('POSTGRES_DB') : type) +
					'.sqlite',
			),
			synchronize: true,
		}),
	});
