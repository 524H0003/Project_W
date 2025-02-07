import { Field, InputType } from '@nestjs/graphql';
import { EventStatus, EventType, IEventInfo } from './event.model';

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
	@Field(() => JSON, { nullable: true, defaultValue: '' })
	additionalFields: object;
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
	@Field(() => JSON, { nullable: true }) additionalFields: object;
	@Field({ nullable: true }) requiredSkills: string;
	@Field({ nullable: false }) id: string;
}
