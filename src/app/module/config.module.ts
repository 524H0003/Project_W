import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import 'app/utils/utils';

/**
 * @ignore
 */
export const loadEnv =
	// Load .env
	ConfigModule.forRoot({
		isGlobal: true,
		validationSchema: Joi.object({
			// Postgres
			POSTGRES_HOST: Joi.string().default('localhost'),
			POSTGRES_PORT: Joi.number().default(5432),
			POSTGRES_USER: Joi.string().default('postgres'),
			POSTGRES_DB: Joi.string().default('postgres'),
			POSTGRES_PASS: Joi.string().default('postgres'),
			POSTGRES_SSL: Joi.string().default(false),
			// Access token
			ACCESS_SECRET: Joi.string().default('access'),
			ACCESS_EXPIRE: Joi.string().default('6m'),
			// Refresh token
			REFRESH_SECRET: Joi.string().default('refresh'),
			REFRESH_EXPIRE: Joi.string().default('66d'),
			REFRESH_USE: Joi.number().default(60),
			// Server config
			SERVER_SECRET: Joi.string().default('project-w'),
			SERVER_PORT: Joi.number().default(3000),
			SERVER_PUBLIC: Joi.string().default('./public/'),
			SERVER_FILE_SIZE_LIMIT: Joi.number().default(256),
			// ADMIN
			ADMIN_EMAIL: process.argv.some((i) => i == '--test-mail')
				? 'test@test.test'
				: Joi.string().default('admin'),
			// AWS
			AWS_REGION: Joi.string().default(false),
			AWS_ACCESS_KEY_ID: Joi.string(),
			AWS_SECRET_ACCESS_KEY: Joi.string(),
			AWS_ENDPOINT: Joi.string(),
			AWS_BUCKET: Joi.string(),
			// SMTP
			SMTP_USER: Joi.string().default(''),
			SMTP_PASS: Joi.string().default(''),
			// Caching
			REDIS_USER: Joi.string().default('default'),
			REDIS_PASS: Joi.string().default(''),
			REDIS_HOST: Joi.string().default('localhost'),
			REDIS_PORT: Joi.string().default('6379'),
		}),
	});
