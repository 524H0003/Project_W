import { IDevice } from 'auth/device/device.model';
import { IEventParticipator } from 'event/event.model';
import { IFile } from 'file/file.model';

// Interfaces
export interface IUserAuthentication {
	email: string;
	password: string;
}

export interface IUserInfo {
	fullName: string;
	avatarPath: string;
	role: UserRole;
}

export interface IUserTimeRecord {
	lastLogin: Date;
}

export interface IUserStatus {
	isActive: boolean;
}

export interface IUser
	extends IUserAuthentication,
		IUserInfo,
		IUserTimeRecord,
		IUserStatus {
	devices?: IDevice[];
	uploadFiles?: IFile[];
	participatedEvents: IEventParticipator[];
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
}
