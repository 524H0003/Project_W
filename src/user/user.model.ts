import { IBaseUser, IBaseUserEmail } from 'app/app.model';
import { IDeviceEntity } from 'auth/device/device.model';
import { IHook } from 'app/hook/hook.model';
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
 * @ignore
 */
export interface IUserRelationship {
	baseUser: IBaseUser;
	recievedNotifications: IReciever[];
	devices: IDeviceEntity[];
	uploadFiles: IFile[];
	participatedEvents: IEventParticipator[];
	hooks: IHook[];
}

/**
 * User class
 */
export interface IUserEntity
	extends IUserAuthentication,
		IUserInfo,
		IUserRelationship {}

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
export interface IUserLogin extends IUserAuthentication, IBaseUserEmail {}

/**
 * Sign up fields
 */
export interface IUserSignUp extends IUserAuthentication, IBaseUser {}

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
