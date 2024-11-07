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
 * @ignore
 */
export interface IEmployeeRelationship {
	eventCreator: IEventCreatorEntity;
	enterprise: IEnterprise;
}
/**
 * @ignore
 */
export interface IEmployeeEntity extends IEmployeeRelationship, IEmployeeInfo {}
/**
 * Employee signup model
 */
export interface IEmployeeSignup extends IEmployeeInfo, IUserSignUp {
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

	/**
	 * Employee's email
	 */
	email: string;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
