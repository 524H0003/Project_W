import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventCreator } from 'event/creator/creator.model';
import { ISignUp } from 'user/user.model';

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

/**
 * Employee signup model
 */
export interface IEmployeeSignup extends ISignUp {
	/**
	 * Signature to sign up
	 */
	signature: string;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
