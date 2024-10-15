import { IEventCreator } from './creator/creator.model';
import { IEventParticipator } from './participator/participator.model';
import { ITag } from './tag/tag.model';
/**
 * Event model
 */
export interface IEvent {
    /**
     * The event creator
     */
    createdBy: IEventCreator;
    /**
     * Event's participators
     */
    participators: IEventParticipator[];
    /**
     * Event's tags
     */
    tags: ITag[];
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
    additionalFields: any;
}
export declare enum EventStatus {
    draft = "draft",
    published = "published",
    cancelled = "cancelled",
    completed = "completed"
}
export declare enum EventType {
    internship = "internship",
    job_fair = "job_fair",
    workshop = "workshop",
    seminar = "seminar"
}
