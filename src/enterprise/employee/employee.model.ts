import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventCreator } from 'event/creator/creator.model';

// Interfaces
export interface IEmployee {
	user: IEventCreator;

	enterprise: IEnterprise;

	position: EmployeePosition;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
