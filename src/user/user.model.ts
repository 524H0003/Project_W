import { IDevice } from 'auth/device/device.model';
import { IHook } from 'auth/hook/hook.model';
import { IEventParticipator } from 'event/participator/participator.model';
import { IFile } from 'file/file.model';
import { IReciever } from 'notification/reciever/reciever.model';

// Interfaces
/**
 * Fileds for user authencation
 * @interface
 */
export interface IUserAuthentication {
	/**
	 * User's email address
	 */
	email: string;

	/**
	 * User's password
	 */
	password: string;
}

/**
 * Fields about user's infomations
 * @interface
 */
export interface IUserInfo {
	fullName: string;
	avatarPath: string;
}

/**
 * Fields about user's time record
 *
 * @interface
 */
export interface IUserTimeRecord {
	lastLogin: Date;
}

/**
 * Fields about user's status
 *
 * @interface
 */
export interface IUserStatus {
	isActive: boolean;
}

/**
 * Fields about user's sensitive infomations
 *
 * @interface
 */
export interface IUserSensitive {
	role: UserRole;
}

/**
 * User fields
 *
 * @interface
 */
export interface IUser
	extends IUserAuthentication,
		IUserInfo,
		IUserTimeRecord,
		IUserSensitive,
		IUserStatus {
	recievedNotifications: IReciever[];
	devices: IDevice[];
	uploadFiles: IFile[];
	participatedEvents: IEventParticipator[];
	hooks: IHook[];
}

/**
 * Fields about user's recieved properties
 *
 * @interface
 */
export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}

/**
 * Login fields
 *
 * @interface
 */
export interface ILogin extends IUserAuthentication {}

/**
 * Sign up fields
 *
 * @interface
 */
export interface ISignUp extends IUserAuthentication, IUserInfo {}

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
