import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';

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
			ACCESS_SECRET: Joi.string().required(),
			ACCESS_EXPIRE: Joi.string().default('5m'),
			// Refresh token
			REFRESH_SECRET: Joi.string().required(),
			REFRESH_EXPIRE: Joi.string().default('60d'),
			// Server config
			SERVER_SECRET: Joi.string().required(),
			SERVER_PORT: Joi.number().default(3000),
			SERVER_PUBLIC: Joi.string().default('./public/'),
			SERVER_FILE_SIZE_LIMIT: Joi.number().default(256),
			// ADMIN
			ADMIN_EMAIL: Joi.string().default('test@test.test'),
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
			REDIS_URL: Joi.string().default('redis://default:@localhost:6379'),
		}),
	});
