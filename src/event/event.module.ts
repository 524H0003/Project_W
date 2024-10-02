import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventTypeModule } from 'eventType/eventType.module';
import { Event } from './event.entity';
import { EventStatus } from './event.model';

@Module({ imports: [TypeOrmModule.forFeature([Event]), EventTypeModule] })
export class EventModule {
	constructor() {
		registerEnumType(EventStatus, { name: 'EventStatus' });
	}
}
