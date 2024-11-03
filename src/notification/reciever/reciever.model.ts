import { INotification } from 'notification/notification.model';
import { IUserClass } from 'user/user.model';

// Interfaces
/**
 * Notification reciever to user
 */
export interface IReciever {
	/**
	 * Recieve user
	 */
	to: IUserClass;

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
