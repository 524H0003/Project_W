import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notification.entity';
import { Reciever } from './reciever/reciever.entity';

@Module({ imports: [TypeOrmModule.forFeature([Notification, Reciever])] })
export class NotificationModule {}
