import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Reciever } from './reciever/reciever.entity';
import { AppModule } from 'app/app.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Notification, Reciever]),
		forwardRef(() => AppModule),
	],
})
export class NotificationModule {}
