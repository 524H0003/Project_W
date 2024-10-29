import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaseUser } from './app.entity';
import { AppController } from 'app/app.controller';
import { AppService } from 'app/app.service';
import { HookModule } from './hook/hook.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from 'auth/auth.module';
import { DeviceModule } from 'auth/device/device.module';
import { SessionModule } from 'auth/session/session.module';
import { EnterpriseModule } from 'enterprise/enterprise.module';
import { EventModule } from 'event/event.module';
import { FileModule } from 'file/file.module';
import { UniversityModule } from 'university/university.module';
import { UserModule } from 'user/user.module';
import { NotificationModule } from 'notification/notification.module';

const modules = [
	HookModule,
	MailModule,
	AuthModule,
	DeviceModule,
	SessionModule,
	EnterpriseModule,
	EventModule,
	FileModule,
	NotificationModule,
	UniversityModule,
	UserModule,
];

@Module({
	imports: [
		TypeOrmModule.forFeature([BaseUser]),
		...modules.map((i) => forwardRef(() => i)),
	],
	providers: [AppService],
	controllers: [AppController],
	exports: [AppService, ...modules],
})
export class AppModule {}
