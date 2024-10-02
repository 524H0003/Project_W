import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventType } from 'eventType/eventType.model';
import { IStudent } from 'student/student.model';
import { IRecordTime } from 'types';

// Interfaces
export interface IEvent {
	createdBy: IEnterprise;
	watchingBy: IStudent[];
	startDate: Date;
	endDate: Date;
	title: string;
	description: string;
	status: EventStatus;
	positionsAvaliable: number;
	maxParticipants: number;
	location: string;
	eventType: IEventType;
}

// Enums
export enum EventStatus {
	ONGOING = 'ONGOING',
	ENDED = 'ENDED',
	PENDING = 'PENDING',
}
