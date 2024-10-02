import { ConfigModule } from '@nestjs/config';
import Joi from 'joi';
import 'utils/utils';

export const loadEnv = (type: 'deploy' | 'test') =>
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
			// Access token
			ACCESS_SECRET:
				type === 'deploy'
					? Joi.string().required()
					: Joi.string().default((10).string),
			ACCESS_EXPIRE: Joi.string().default('6m'),
			// Refresh token
			REFRESH_SECRET:
				type === 'deploy'
					? Joi.string().required()
					: Joi.string().default((10).string),
			REFRESH_EXPIRE: Joi.string().default('66d'),
			REFRESH_USE: Joi.number().default(6),
			// Server config
			SERVER_SECRET: Joi.string().default((64).alpha),
			SERVER_IN_DEV: Joi.bool().default(true),
			SERVER_PORT: Joi.number().default(3000),
			SERVER_COOKIE_PREFIX: Joi.string().default((12).alpha),
			SERVER_PUBLIC: Joi.string().default('./public/'),
			// AES
			AES_ALGO: Joi.string().default('aes-256-ctr'),
			// ADMIN
			ADMIN_EMAIL: Joi.string().default('admin'),
			ADMIN_PASSWORD: Joi.string().default('admin'),
			// Custom keys
			REFRESH_KEY: Joi.string().default((32).string),
			ACCESS_KEY: Joi.string().default((32).string),
			// AWS
			AWS_REGION: Joi.string().default(false),
			AWS_ACCESS_KEY_ID: Joi.string(),
			AWS_SECRET_ACCESS_KEY: Joi.string(),
			AWS_ENDPOINT: Joi.string(),
			AWS_BUCKET: Joi.string(),
		}),
	});
