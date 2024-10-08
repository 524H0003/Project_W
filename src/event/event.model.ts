import { IEventCreator } from './creator/creator.model';
import { IEventParticipator } from './participator/participator.model';
import { ITag } from './tag/tag.model';

// Interfaces
export interface IEvent {
	createdBy: IEventCreator;
	participators: IEventParticipator[];
	tags: ITag[];
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
