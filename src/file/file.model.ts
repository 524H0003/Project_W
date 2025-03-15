import { IEventEntity } from 'event/event.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * File infomations
 */
export interface IFileInfo {
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

/**
 * File relationships
 */
export interface IFileRelationship {
	/**
	 * File creator
	 */
	fileCreatedBy: IUserEntity;

	/**
	 * File create for event
	 */
	atEvent: IEventEntity;
}

/**
 * File entity
 */
export interface IFileEntity extends IFileInfo, IFileRelationship {}

// Enums
export enum FileType {
	resume = 'resume',
	report = 'report',
	certificate = 'certificate',
	other = 'other',
}
