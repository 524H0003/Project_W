import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
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
 * Server sql configuration
 */
export const sqlOptions = (
	type: 'deploy' | 'test',
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
 * @ignore
 */
export const SqlModule = (type: 'deploy' | 'test') =>
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: async (cfgSvc: ConfigService) => {
			try {
				await createPostgresDatabase({
					options: sqlOptions(type, cfgSvc),
					ifNotExist: true,
				});
			} catch {}
			return {
				...sqlOptions(type, cfgSvc),
				autoLoadEntities: true,
				synchronize: true,
			};
		},
	});
