import { IEnterprise } from 'enterprise/enterprise.model';
import { IEventCreatorEntity } from 'event/creator/creator.model';
import { IUserSignUp } from 'user/user.model';

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
export interface IEmployeeRelationship {
	/**
	 * @ignore
	 */
	user: IEventCreatorEntity;

	/**
	 * Employee's working enterprise
	 */
	enterprise: IEnterprise;
}
/**
 * Employee class model
 */
export interface IEmployeeClass extends IEmployeeRelationship, IEmployeeInfo {}
/**
 * Enterprise signature for employee
 */
export interface IEmployeeSignature {
	/**
	 * Signature to sign up
	 */
	signature: string;
}

/**
 * Employee signup model
 */
export interface IEmployeeSignup
	extends IEmployeeSignature,
		IEmployeeInfo,
		IUserSignUp {}

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
