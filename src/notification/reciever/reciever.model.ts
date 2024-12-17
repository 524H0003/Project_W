import { INotificationInfo } from 'notification/notification.model';
import { IUserInfo } from 'user/user.model';

// Interfaces
/**
 * Notification reciever to user
 */
export interface IRecieverInfo {
	/**
	 * Notification status
	 */
	isRead: boolean;

	/**
	 * Notification time record
	 */
	readAt: Date;
}

/**
 * Notification's relationships
 */
export interface IRecieverRelationships {
	/**
	 * Recieve user
	 */
	toUser: IUserInfo;

	/**
	 * Notification origin
	 */
	fromNotification: INotificationInfo;
}

/**
 * Notification's entity
 */
export interface IRecieverEntity
	extends IRecieverRelationships,
		IRecieverInfo {}
