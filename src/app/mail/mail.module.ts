import { MailerModule, MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { forwardRef, Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';
import { AppModule } from 'app/app.module';

@Module({
	imports: [
		forwardRef(() => AppModule),
		MailerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (cfgSvc: ConfigService): MailerOptions => {
				return {
					transport: {
						host: 'smtp.gmail.com',
						secure: true,
						auth: {
							user: cfgSvc.get('SMTP_USER'),
							pass: cfgSvc.get('SMTP_PASS'),
						},
					},
					defaults: { from: '"Unreal mail" <secret@student.tdtu.edu.vn>' },
					template: {
						dir: join(__dirname, 'templates'),
						adapter: new HandlebarsAdapter(),
						options: { strict: true },
					},
				};
			},
		}),
	],
	providers: [MailService],
	exports: [MailService],
})
export class MailModule {}
