import { IEvent } from 'event/event.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IFile {
	createdBy: IUser;
	atEvent: IEvent;
	title: string;
	path: string;
	type: FileType;
	uploadedAt: Date;
}

// Enums
export enum FileType {
	resume = 'resume',
	report = 'report',
	certificate = 'certificate',
	other = 'other',
}
