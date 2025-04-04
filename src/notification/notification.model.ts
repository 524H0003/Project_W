import { IEntityId } from 'app/typeorm/typeorm.model';
import { IRecieverEntity } from './reciever/reciever.model';

// Interfaces
/**
 * Notification's infomations
 */
export interface INotificationInfo extends IEntityId {
	/**
	 * Notification title
	 */
	title: string;

	/**
	 * Notification content
	 */
	content: string;

	/**
	 * Notification type
	 */
	type: NotificationType;
}

/**
 * Notification's relationships
 */
export interface INotificationRelationship {
	/**
	 * Notification send to
	 */
	sent: IRecieverEntity[];
}

/**
 * Notification entity
 */
export interface INotificationEntity
	extends INotificationInfo,
		INotificationRelationship {}

// Enums
export enum NotificationType {
	event = 'event',
	participation = 'participator',
	progress = 'progress',
	system = 'system',
}
