import { IEvent } from 'event/event.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IFile {
	path: string;
	createdBy: IUser;
	atEvent: IEvent;
	title: string;
	uploadedAt: Date;
	type: FileType;
}

// Enums
export enum FileType {
	resume = 'resume',
	report = 'report',
	certificate = 'certificate',
}
