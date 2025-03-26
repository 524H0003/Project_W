import { IEntityId } from 'app/app.model';
import { IEventParticipatorEntiy } from 'event/participator/participator.model';
import { IFileEntity } from 'file/file.model';
import { IRecieverEntity } from 'notification/reciever/reciever.model';
import {
	IBaseUserEmail,
	IBaseUserEntity,
	IBaseUserInfo,
} from './base/baseUser.model';
import { IBlocCompulsory } from 'auth/bloc/bloc.model';

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
	extends IEntityId,
		IUserTimeRecord,
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
	uploadFiles?: IFileEntity[];
	participatedEvents?: IEventParticipatorEntiy[];
}

/**
 * User class
 */
export interface IUserEntity
	extends IUserAuthentication,
		IUserInfo,
		IUserRelationship {
	hashedPassword?: string;
}

export interface IResponse {
	message: string;
	user: IUserInfo;
}

/**
 * Fields about user's recieved properties
 */
export interface IUserRecieve {
	/**
	 * Bloc id
	 */
	blocInfo: Required<IBlocCompulsory>;

	/**
	 * Server's response
	 */
	response: Partial<IResponse>;

	/**
	 * Hook id
	 */
	HookId: string;

	/**
	 * Clear cookie
	 */
	isClearCookie: boolean;
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
