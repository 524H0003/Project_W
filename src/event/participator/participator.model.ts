import { IEvent } from 'event/event.model';
import { IStudent } from 'university/student/student.model';

// Interfaces
export interface IEventParticipator {
	from: IEvent;
	participatedBy: IStudent;
	role: EventParticipatorRole;
	status: EventParticipatorStatus;
	isAttended: boolean;
	registeredAt: Date;
	interviewAt: Date;
	interviewNote: string;
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
