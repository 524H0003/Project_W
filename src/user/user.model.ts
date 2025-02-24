import { IBaseUserEntity, IBaseUserEmail, IBaseUserInfo } from 'app/app.model';
import { IEventParticipatorEntiy } from 'event/participator/participator.model';
import { IFile } from 'file/file.model';
import { IRecieverEntity } from 'notification/reciever/reciever.model';

// Interfaces
/**
 * Fileds for user authencation
 */
export interface IUserAuthentication {
	/**
	 * User's password
	 */
	password: string;
}

/**
 * Fields about user's infomations
 */
export interface IUserInfo
	extends IUserTimeRecord,
		IUserStatus,
		IUserSensitive {}

/**
 * Fields about user's time record
 */
export interface IUserTimeRecord {
	/**
	 * User's last login date
	 */
	lastLogin?: Date;
}

/**
 * Fields about user's status
 */
export interface IUserStatus {
	/**
	 * Is user active
	 */
	isActive?: boolean;
}

/**
 * Fields about user's sensitive infomations
 */
export interface IUserSensitive {
	/**
	 * User's role
	 */
	role: UserRole;
}

/**
 * User entity relationships
 */
export interface IUserRelationship {
	baseUser: IBaseUserEntity;
	recievedNotifications?: IRecieverEntity[];
	uploadFiles?: IFile[];
	participatedEvents?: IEventParticipatorEntiy[];
}

/**
 * User class
 */
export interface IUserEntity
	extends IUserAuthentication,
		IUserInfo,
		IUserRelationship {}

/**
 * Server response interface
 */
export interface IResponse {
	message?: string;
	token?: string;
	user?: IUserInfo;
}

/**
 * Fields about user's recieved properties
 */
export interface IUserRecieve {
	/**
	 * Access token
	 */
	accessToken: string;

	/**
	 * Refresh token
	 */
	refreshToken: string;

	/**
	 * Server's response
	 */
	response: IResponse;
}

/**
 * Login fields
 */
export interface IUserLogIn extends IUserAuthentication, IBaseUserEmail {}

/**
 * Sign up fields
 */
export interface IUserSignUp extends IUserAuthentication, IBaseUserInfo {}

// Enums
/**
 * User roles
 */
export enum UserRole {
	student = 'student',
	faculty = 'faculty',
	enterprise = 'enterprise',
	undefined = 'undefined',
	admin = 'admin',
}
