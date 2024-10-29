import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventCreator } from 'event/creator/creator.model';
import { ISignUp } from 'user/user.model';

// Interfaces
/**
 * Employee's general infomations
 */
export interface IEmployeeInfo {
	/**
	 * Employee's position
	 */
	position: EmployeePosition;
}

/**
 * Employee model
 */
export interface IEmployee extends IEmployeeInfo {
	/**
	 * @ignore
	 */
	user: IEventCreator;

	/**
	 * Employee's working enterprise
	 */
	enterprise: IEnterprise;
}

/**
 * Employee signup model
 */
export interface IEmployeeSignup extends ISignUp, IEmployeeInfo {
	/**
	 * Signature to sign up
	 */
	signature: string;
}

/**
 * Employee hooking
 */
export interface IEmployeeHook {
	/**
	 * Employee's working enterprise
	 */
	enterpriseName: string;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
