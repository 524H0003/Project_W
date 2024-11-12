import { IEventEntity } from 'event/event.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * File model
 */
export interface IFile {
	/**
	 * File creator
	 */
	fileCreatedBy: IUserEntity;

	/**
	 * File create for event
	 */
	atEvent: IEventEntity;

	/**
	 * File's title
	 */
	title: string;

	/**
	 * File's path
	 */
	path: string;

	/**
	 * File's type
	 */
	type: FileType;

	/**
	 * File's upload time
	 */
	uploadedAt: Date;
}

// Enums
export enum FileType {
	resume = 'resume',
	report = 'report',
	certificate = 'certificate',
	other = 'other',
}
