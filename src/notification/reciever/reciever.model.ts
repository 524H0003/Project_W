import { INotification } from 'notification/notification.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Notification reciever to user
 */
export interface IReciever {
	/**
	 * Recieve user
	 */
	to: IUserEntity;

	/**
	 * Notification origin
	 */
	from: INotification;

	/**
	 * Notification status
	 */
	isRead: boolean;

	/**
	 * Notification time record
	 */
	readAt: Date;
}
