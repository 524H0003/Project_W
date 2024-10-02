import { IDevice } from 'device/device.model';
import { IFile } from 'file/file.model';
import { IRecordTime } from 'utils/model.utils';

// Interfaces
export interface IUserAuthentication {
	email: string;
	password: string;
}

export interface IUserInfo {
	name: string;
	email: string;
	phone: string;
	address: string;

	avatarFilePath?: string;

	roles?: Role[];
}

export interface IUser extends IUserAuthentication, IUserInfo {
	devices?: IDevice[];
	uploadFiles?: IFile[];
}

export interface IUserRecieve {
	accessToken: string;
	refreshToken: string;
}

export interface ILogin extends IUserAuthentication {}
export interface ISignUp extends IUserAuthentication, IUserInfo {}

// Enums
export enum Role {
	USER = 'USER',
	ADMIN = 'ADMIN',
	STAFF = 'STAFF',
	STUDENT = 'STUDENT',
	ENTERPRISE = 'ENTERPRISE',
	FACULTY = 'FACULTY',
}
