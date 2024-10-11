import { IDevice } from 'auth/device/device.model';
import { IHook } from 'auth/hook/hook.model';
import { IEventParticipator } from 'event/participator/participator.model';
import { IFile } from 'file/file.model';
import { IReciever } from 'notification/reciever/reciever.model';

// Interfaces
export interface IUserAuthentication {
	email: string;
	password: string;
}

export interface IUserInfo {
	fullName: string;
	avatarPath: string;
}

export interface IUserTimeRecord {
	lastLogin: Date;
}

export interface IUserStatus {
	isActive: boolean;
}

export interface IUserSensitive {
	role: UserRole;
}

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

export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}

export interface ILogin extends IUserAuthentication {}
export interface ISignUp extends IUserAuthentication, IUserInfo {}

// Enums
export enum UserRole {
	student = 'student',
	faculty = 'faculty',
	enterprise = 'enterprise',
	undefined = 'undefined',
	admin = 'admin',
}
