import { IEntityId } from 'app/typeorm/typeorm.model';
import { IEventEntity } from 'event/event.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Event participator model
 */
export interface IEventParticipatorRelationships {
	/**
	 * Participator from event
	 */
	fromEvent: IEventEntity;

	/**
	 * The user participate event
	 */
	participatedBy: IUserEntity;
}

/**
 * Event participator's info
 */
export interface IEventParticipatorInfo extends IEntityId {
	/**
	 * The role in event
	 */
	role: EventParticipatorRole;

	/**
	 * The status in event
	 */
	status: EventParticipatorStatus;

	/**
	 * If participator attended
	 */
	isAttended: boolean;

	/**
	 * Participator register time record
	 */
	registeredAt: Date;

	/**
	 * Participator interview time record
	 */
	interviewAt: Date;

	/**
	 * Participator interview note
	 */
	interviewNote: string;

	/**
	 * Addition data
	 */
	additionalData: object;
}

/**
 * Event participator's entity
 */
export interface IEventParticipatorEntiy
	extends IEventParticipatorInfo,
		IEventParticipatorRelationships {}

// Enums
export enum EventParticipatorStatus {
	registered = 'registered',
	confirmed = 'confirmed',
	cancelled = 'cancelled',
	attended = 'attended',
}

export enum EventParticipatorRole {
	attendee = 'attendee',
	organizer = 'organizer',
	speaker = 'speaker',
}
