import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventCreator } from 'event/creator/creator.model';

// Interfaces
/**
 * Employee model
 */
export interface IEmployee {
	/**
	 * @ignore
	 */
	user: IEventCreator;

	/**
	 * Employee's working enterprise
	 */
	enterprise: IEnterprise;

	/**
	 * Employee's position
	 */
	position: EmployeePosition;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
