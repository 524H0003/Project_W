import { IDevice } from 'auth/device/device.model';
import { IHook } from 'auth/hook/hook.model';
import { IEventParticipator } from 'event/participator/participator.model';
import { IFile } from 'file/file.model';
import { JwtPayload } from 'jsonwebtoken';
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
export interface IUserInfo
	extends IUserTimeRecord,
		IUserStatus,
		IUserSensitive {
	/**
	 * User's full name
	 */
	fullName: string;
	/**
	 * User's avatar path
	 */
	avatarPath: string;
}

/**
 * Fields about user's time record
 */
export interface IUserTimeRecord {
	/**
	 * User's last login date
	 */
	lastLogin: Date;
}

/**
 * Fields about user's status
 */
export interface IUserStatus {
	/**
	 * Is user active
	 */
	isActive: boolean;
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
 * User model
 */
export interface IUser extends IUserAuthentication, IUserInfo {
	/**
	 * Recieved notifications
	 */
	recievedNotifications: IReciever[];

	/**
	 * Signed in devices
	 */
	devices: IDevice[];

	/**
	 * Uploaded files
	 */
	uploadFiles: IFile[];

	/**
	 * Participated events
	 */
	participatedEvents: IEventParticipator[];

	/**
	 * Hooks
	 */
	hooks: IHook[];
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
	response: string | IUserInfo;

	/**
	 * Jwt payload
	 */
	payload: JwtPayload;
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
