import { join } from 'path';
import { Module } from '@nestjs/common';
import { loadEnv } from 'app/module/config.module';
import { PostgresModule, SqliteModule } from 'app/module/sql.module';
import { AppModule } from 'app/app.module';
import { APP_GUARD, HttpAdapterHost } from '@nestjs/core';
import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { InitServerClass } from 'app/utils/server.utils';
import { JwtService } from '@nestjs/jwt';
import { ScheduleModule } from '@nestjs/schedule';
import { BaseModule } from 'app/module/base.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ModifiedThrottlerGuard } from 'app/app.fix';

@Module({
	imports: [
		// Api rate limit
		ThrottlerModule.forRoot({
			throttlers: [{ limit: 2, ttl: 1000, name: 'defaultThrottler' }],
			errorMessage: new ServerException('Fatal', 'User', 'Request').message,
		}),
		// Mail
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService): MailerOptions => {
				return {
					transport: process.argv.some((i) => i == '--test-email')
						? { secure: false, host: 'localhost', port: 7777 }
						: {
								host: 'smtp.gmail.com',
								secure: true,
								auth: {
									user: config.get('SMTP_USER'),
									pass: config.get('SMTP_PASS'),
								},
							},
					defaults: { from: '"Unreal mail" <secret@student.tdtu.edu.vn>' },
					template: {
						dir: join(__dirname, '../app/mail/templates'),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
		}),
		// Core modules
		BaseModule,
		loadEnv,
		PostgresModule('deploy'),
		SqliteModule('deploy'),
		// Application modules
		AppModule,
		// Schedule mmodule
		ScheduleModule.forRoot(),
	],
	providers: [{ provide: APP_GUARD, useClass: ModifiedThrottlerGuard }],
})
export class MainModule extends InitServerClass {
	constructor(
		protected httpAdapterHost: HttpAdapterHost,
		protected config: ConfigService,
		protected jwt: JwtService,
	) {
		super(httpAdapterHost, config, jwt);
	}
}
