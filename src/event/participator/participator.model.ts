import { IEvent } from 'event/event.model';
import { IUser } from 'user/user.model';

// Interfaces
/**
 * Event participator model
 */
export interface IEventParticipator {
	/**
	 * Participator from event
	 */
	from: IEvent;

	/**
	 * The user participate event
	 */
	participatedBy: IUser;

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
	additionalData: any;
}

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
