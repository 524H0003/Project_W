import { INotification } from 'notification/notification.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IReciever {
	to: IUser;
	from: INotification;
	isRead: boolean;
	readAt: Date;
}
