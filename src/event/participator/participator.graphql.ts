import { Field, InputType } from '@nestjs/graphql';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipatorInfo,
} from './participator.model';
import JSON from 'graphql-type-json';

@InputType()
export class EventParticipatorAssign {
	@Field() userId: string;
	@Field() eventId: string;
}

@InputType()
export class EventParticipatorUpdate implements IEventParticipatorInfo {
	@Field({ nullable: true }) role: EventParticipatorRole;
	@Field({ nullable: true }) status: EventParticipatorStatus;
	@Field({ nullable: true }) isAttended: boolean;
	@Field({ nullable: true }) registeredAt: Date;
	@Field({ nullable: true }) interviewAt: Date;
	@Field({ nullable: true }) interviewNote: string;
	@Field(() => JSON, { nullable: true, defaultValue: '' })
	additionalData: object;
	@Field() id: string;
}
