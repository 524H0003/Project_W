import { Field, InputType } from '@nestjs/graphql';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipatorInfo,
} from './participator.model';
import GQLJSON from 'graphql-type-json';

@InputType()
export class EventParticipatorAssign {
	@Field() userId: string;
	@Field() eventId: string;
}

@InputType()
export class EventParticipatorUpdate implements IEventParticipatorInfo {
	@Field({ nullable: true }) role: typeof EventParticipatorRole;
	@Field({ nullable: true }) status:typeof EventParticipatorStatus;
	@Field({ nullable: true }) isAttended: boolean;
	@Field({ nullable: true }) registeredAt: Date;
	@Field({ nullable: true }) interviewAt: Date;
	@Field({ nullable: true }) interviewNote: string;
	@Field(() => GQLJSON, { nullable: true, defaultValue: '' })
	additionalData: JSON;
	@Field() id: string;
}
