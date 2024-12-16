import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Reciever } from './reciever/reciever.entity';
import { AppModule } from 'app/app.module';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { registerEnumType } from '@nestjs/graphql';
import { NotificationType } from './notification.model';

@Module({
	imports: [
		TypeOrmModule.forFeature([Notification, Reciever]),
		forwardRef(() => AppModule),
	],
	providers: [NotificationService, NotificationResolver],
	exports: [NotificationService],
})
export class NotificationModule {
	constructor() {
		registerEnumType(NotificationType, { name: 'notification_type' });
	}
}
