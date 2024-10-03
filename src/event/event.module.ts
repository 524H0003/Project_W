import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event, EventCreator, EventParticipator } from './event.entity';
import { EventStatus, EventType } from './event.model';

@Module({
	imports: [TypeOrmModule.forFeature([Event, EventParticipator, EventCreator])],
})
export class EventModule {
	constructor() {
		registerEnumType(EventStatus, { name: 'event_status' });
		registerEnumType(EventType, { name: 'event_type' });
	}
}
