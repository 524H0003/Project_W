import { IDevice } from 'auth/device/device.model';
import { IHook } from 'auth/hook/hook.model';
import { IEventParticipator } from 'event/participator/participator.model';
import { IFile } from 'file/file.model';
import { IReciever } from 'notification/reciever/reciever.model';

// Interfaces
/**
 * Fileds for user authencation
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
 */
export interface IUserInfo {
	fullName: string;
	avatarPath: string;
}

/**
 * Fields about user's time record
 */
export interface IUserTimeRecord {
	lastLogin: Date;
}

/**
 * Fields about user's status
 */
export interface IUserStatus {
	isActive: boolean;
}

/**
 * Fields about user's sensitive infomations
 */
export interface IUserSensitive {
	role: UserRole;
}

/**
 * User model
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
 */
export interface ILogin extends IUserAuthentication {}

/**
 * Sign up fields
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
