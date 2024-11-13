import { forwardRef, Module } from '@nestjs/common';
import { registerEnumType } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventStatus, EventType } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { Event } from './event.entity';
import { EventTag } from './tag/tag.entity';
import { EventCreator } from './creator/creator.entity';
import { EventCreatorService } from './creator/creator.service';
import { AppModule } from 'app/app.module';
import { EventService } from './event.service';
import { EventController } from './event.controller';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Event,
			EventParticipator,
			EventCreator,
			EventTag,
		]),
		forwardRef(() => AppModule),
	],
	providers: [EventCreatorService, EventService],
	exports: [EventCreatorService, EventService],
	controllers: [EventController],
})
export class EventModule {
	constructor() {
		registerEnumType(EventStatus, { name: 'event_status' });
		registerEnumType(EventType, { name: 'event_type' });
	}
}
