import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { sqlOptions } from 'app/module/sql.module';
import { NestFactory } from '@nestjs/core';
import { TypeOrmModule } from './typeorm.module';

async function bootstrap() {
	const app = await NestFactory.create(TypeOrmModule),
		config = app.get(ConfigService);

	return new DataSource(sqlOptions('deploy', config));
}

export default bootstrap();
