import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { postgresConfig } from 'app/module/sql.module';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from './typeorm.module';

async function bootstrap() {
	const app = await NestFactory.create(TypeOrmModule),
		config = app.get(ConfigService);

	return new DataSource(postgresConfig('deploy', config));
}

export default bootstrap();
