import { IEntityId } from 'app/app.model';
import { IEventCreatorEntity } from './creator/creator.model';
import { ITagEntity } from './tag/tag.model';
import { IEventParticipatorEntiy } from './participator/participator.model';
import { IFileEntity } from 'file/file.model';

// Interfaces
/**
 * Event relationship
 */
export interface IEventRelationships {
	/**
	 * The event creator
	 */
	eventCreatedBy: IEventCreatorEntity;

	/**
	 * Event's participators
	 */
	participators: IEventParticipatorEntiy[];

	/**
	 * Event's tags
	 */
	tags: ITagEntity[];

	/**
	 * Event's files
	 */
	documents: IFileEntity[];
}

/**
 * Event model
 */
export interface IEventInfo extends IEntityId {
	/**
	 * Event's title
	 */
	title: string;

	/**
	 * Event's description
	 */
	description: string;

	/**
	 * Event's start date
	 */
	startDate: Date;

	/**
	 * Event's end date
	 */
	endDate: Date;

	/**
	 * Event's type
	 */
	type: EventType;

	/**
	 * Event's status
	 */
	status: EventStatus;

	/**
	 * Event's available positions
	 */
	positionsAvailable: number;

	/**
	 * Event's maximum participator
	 */
	maxParticipants: number;

	/**
	 * Event's location
	 */
	location: string;

	/**
	 * Application deadline
	 */
	applicationDeadline: Date;

	/**
	 * Event's required skills
	 */
	requiredSkills: string;

	/**
	 * Addition fields
	 */
	additionalFields?: object;
}

/**
 * Event entity
 */
export interface IEventEntity extends IEventInfo, IEventRelationships {}

// Enums
export enum EventStatus {
	'Draft' = 'draft',
	'Published' = 'published',
	'Cancelled' = 'cancelled',
	'Completed' = 'completed',
}

export enum EventType {
	'Internship' = 'internship',
	'Job_fair' = 'job_fair',
	'Workshop' = 'workshop',
	'Seminar' = 'seminar',
}
