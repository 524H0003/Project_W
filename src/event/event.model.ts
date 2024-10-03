import { IStudent } from 'student/student.model';

// Interfaces
export interface IEvent {
	createdBy: IEventCreator;
	participators: IEventParticipator[];
	title: string;
	description: string;
	startDate: Date;
	endDate: Date;
	type: EventType;
	status: EventStatus;
	positionsAvailable: number;
	maxParticipants: number;
	location: string;
	applicationDeadline: Date;
	requiredSkills: string;
	additionalFields: any;
}

export interface IEventCreator {
	createdEvents: IEvent[];
}

export interface IEventParticipator {
	from: IEvent;
	participatedBy: IStudent;
	isAttended: boolean;
	registeredAt: Date;
	interviewAt: Date;
	interviewNote: string;
	additionalData: any;
}

// Enums
export enum EventStatus {
	draft = 'draft',
	published = 'published',
	cancelled = 'cancelled',
	completed = 'completed',
}

export enum EventType {
	internship = 'internship',
	job_fair = 'job_fair',
	workshop = 'workshop',
	seminar = 'seminar',
}

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
