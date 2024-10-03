import { IUser } from 'user/user.model';

// Interfaces
export interface IFile {
	path: string;
	createdBy: IUser;
	forEveryone: boolean;
}
