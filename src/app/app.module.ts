import { forwardRef, Module } from '@nestjs/common';
import { AppController, HealthController } from 'app/app.controller';
import { AppService } from 'app/app.service';
import { HookModule } from './hook/hook.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from 'auth/auth.module';
import { EnterpriseModule } from 'enterprise/enterprise.module';
import { EventModule } from 'event/event.module';
import { FileModule } from 'file/file.module';
import { UniversityModule } from 'university/university.module';
import { UserModule } from 'user/user.module';
import { NotificationModule } from 'notification/notification.module';
import { AWSModule } from '../file/aws/aws.module';
import { TerminusModule } from '@nestjs/terminus';
import { BlocModule } from 'auth/bloc/bloc.module';

/**
 * List of server modules
 */
const modules = [
	HookModule,
	AWSModule,
	MailModule,
	AuthModule,
	BlocModule,
	EnterpriseModule,
	EventModule,
	FileModule,
	NotificationModule,
	UniversityModule,
	UserModule,
];

/**
 * App module class
 */
@Module({
	imports: [
		TerminusModule.forRoot({
			gracefulShutdownTimeoutMs: (30).s2ms,
			logger: false,
		}),
		...modules.map((i) => forwardRef(() => i)),
	],
	providers: [AppService],
	controllers: [AppController, HealthController],
	exports: [AppService, ...modules],
})
export class AppModule {}
