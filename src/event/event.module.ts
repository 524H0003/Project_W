import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventCreator } from './creator/creator.entity';
import { EventStatus, EventType } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { Event } from './event.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Event, EventParticipator, EventCreator])],
})
export class EventModule {
	constructor() {
		registerEnumType(EventStatus, { name: 'event_status' });
		registerEnumType(EventType, { name: 'event_type' });
	}
}
