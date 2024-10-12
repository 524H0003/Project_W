import { INotification } from 'notification/notification.model';
import { IUser } from 'user/user.model';

// Interfaces
/**
 * Notification reciever to user
 */
export interface IReciever {
	/**
	 * Recieve user
	 */
	to: IUser;

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
