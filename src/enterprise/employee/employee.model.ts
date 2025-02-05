import { IBaseUserEmail, IBaseUserInfo } from 'app/app.model';
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
 * Employee sign up model
 */
export interface IEmployeeSignUp extends IEmployeeInfo, IUserSignUp {}

/**
 * Employee hooking
 */
export interface IEmployeeHook
	extends IBaseUserInfo,
		IBaseUserEmail,
		IEmployeeInfo {
	/**
	 * Employee's working enterprise
	 */
	enterpriseName: string;
}

// Enums
export enum EmployeePosition {
	'Manager' = 'manager',
	'Human_resource' = 'hr',
	'Recruiter' = 'recruiter',
	'Other' = 'other',
}
