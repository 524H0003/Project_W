import { IEntityId } from 'app/typeorm/typeorm.model';
import { INotificationInfo } from 'notification/notification.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Notification reciever to user
 */
export interface IRecieverInfo extends IEntityId {
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
	toUser: IUserEntity;

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
