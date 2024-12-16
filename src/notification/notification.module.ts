import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Reciever } from './reciever/reciever.entity';
import { AppModule } from 'app/app.module';
import { NotificationService } from './notification.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([Notification, Reciever]),
		forwardRef(() => AppModule),
	],
	providers: [NotificationService],
	exports: [NotificationService],
})
export class NotificationModule {}
