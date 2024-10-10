import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { readFileSync } from 'fs';
import { DataSourceOptions } from 'typeorm';

function readSslCa() {
	try {
		return readFileSync(`./secrets/ca.cert`);
	} catch {
		return null;
	}
}

const sqlOptions = (
	type: 'deploy' | 'test',
	cfgSvc: ConfigService,
): DataSourceOptions => ({
	type: 'postgres',
	host: cfgSvc.get('POSTGRES_HOST'),
	port: cfgSvc.get('POSTGRES_PORT'),
	username: cfgSvc.get('POSTGRES_USER'),
	password: cfgSvc.get('POSTGRES_PASS'),
	database: type === 'deploy' ? cfgSvc.get('POSTGRES_DB') : type,
	synchronize: true,
	ssl: {
		rejectUnauthorized: true,
		ca: readSslCa(),
	},
});

export const SqlModule = (type: 'deploy' | 'test') =>
	TypeOrmModule.forRootAsync({
		imports: [ConfigModule],
		inject: [ConfigService],
		useFactory: (cfgSvc: ConfigService) => {
			if (type === 'deploy')
				return {
					...sqlOptions(type, cfgSvc),
					autoLoadEntities: true,
					synchronize: true,
				};
			else
				return {
					...sqlOptions(type, cfgSvc),
					entities: ['./src/**/*.entity.*'],
					synchronize: true,
				};
		},
	});
