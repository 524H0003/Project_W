import { IUser } from 'types';

// Interfaces
export interface IFile {
	path: string;
	createdBy: IUser;
	forEveryone: boolean;
}
