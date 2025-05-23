import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { EventStatus, EventType, IEventInfo } from './event.model';
import GQLJSON from 'graphql-type-json';
import { PaginateResult } from 'app/graphql/graphql.dto';
import { Event } from './event.entity';

@InputType()
export class EventAssign implements IEventInfo {
	@Field() title: string;
	@Field() startDate: Date;
	@Field() endDate: Date;
	@Field({ nullable: true }) applicationDeadline: Date;
	@Field() positionsAvailable: number;
	@Field() maxParticipants: number;
	@Field() location: string;
	@Field({ nullable: true, defaultValue: '' }) description: string;
	@Field({ nullable: true, defaultValue: EventType['Internship'] })
	type: EventType;
	@Field({ nullable: true, defaultValue: EventStatus['Draft'] })
	status: EventStatus;
	@Field(() => GQLJSON, { nullable: true, defaultValue: '' })
	additionalFields: JSON;
	@Field({ nullable: true, defaultValue: '' }) requiredSkills: string;
}

@InputType()
export class EventUpdate implements IEventInfo {
	@Field({ nullable: true }) title: string;
	@Field({ nullable: true }) startDate: Date;
	@Field({ nullable: true }) endDate: Date;
	@Field({ nullable: true }) applicationDeadline: Date;
	@Field({ nullable: true }) positionsAvailable: number;
	@Field({ nullable: true }) maxParticipants: number;
	@Field({ nullable: true }) location: string;
	@Field({ nullable: true }) description: string;
	@Field({ nullable: true }) type: EventType;
	@Field({ nullable: true }) status: EventStatus;
	@Field(() => GQLJSON, { nullable: true }) additionalFields: JSON;
	@Field({ nullable: true }) requiredSkills: string;
	@Field({ nullable: false }) id: string;
}

@InputType()
export class FindEvent implements IEventInfo {
	@Field({ nullable: true }) title: string;
	@Field({ nullable: true }) startDate: Date;
	@Field({ nullable: true }) endDate: Date;
	@Field({ nullable: true }) applicationDeadline: Date;
	@Field({ nullable: true }) positionsAvailable: number;
	@Field({ nullable: true }) maxParticipants: number;
	@Field({ nullable: true }) location: string;
	@Field({ nullable: true }) description: string;
	@Field({ nullable: true }) type: EventType;
	@Field({ nullable: true }) status: EventStatus;
	@Field({ nullable: true }) requiredSkills: string;
	@Field({ nullable: true }) id: string;
}

@ObjectType()
export class EventPage extends PaginateResult(Event) {}
