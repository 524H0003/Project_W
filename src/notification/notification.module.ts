import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Reciever } from './reciever/reciever.entity';
import { AppModule } from 'app/app.module';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { registerEnumType } from '@nestjs/graphql';
import { NotificationType } from './notification.model';
import { RecieverService } from './reciever/reciever.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Notification, Reciever]),
		forwardRef(() => AppModule),
	],
	providers: [NotificationService, NotificationResolver, RecieverService],
	exports: [NotificationService, RecieverService],
})
export class NotificationModule {
	constructor() {
		registerEnumType(NotificationType, { name: 'notification_type' });
	}
}
