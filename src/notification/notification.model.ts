import { IReciever } from './reciever/reciever.model';

// Interfaces
/**
 * Notification model
 */
export interface INotification {
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

	/**
	 * Notification send to
	 */
	sent: IReciever[];
}

// Enums
export enum NotificationType {
	event = 'event',
	participation = 'participator',
	progress = 'progress',
	system = 'system',
}
