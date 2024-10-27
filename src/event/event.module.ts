import { Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStatus, EventType } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { Event } from './event.entity';
import { EventTag } from './tag/tag.entity';
import { EventCreator } from './creator/creator.entity';
import { EventCreatorService } from './creator/creator.service';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Event,
			EventParticipator,
			EventCreator,
			EventTag,
		]),
	],
	providers: [EventCreatorService],
	exports: [EventCreatorService],
})
export class EventModule {
	constructor() {
		registerEnumType(EventStatus, { name: 'event_status' });
		registerEnumType(EventType, { name: 'event_type' });
	}
}
