import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IReciever } from './reciever.model';
import { User } from 'user/user.entity';
import { Notification } from 'notification/notification.entity';

/**
 * Reciever entity
 */
@Entity({ name: 'UserNotification' })
export class Reciever extends SensitiveInfomations implements IReciever {
	// Relationships
	/**
	 * Recieve user
	 */
	@ManyToOne(() => User, (_: User) => _.recievedNotifications)
	@JoinColumn({ name: 'user_id' })
	toUser: User;

	/**
	 * Notification origin
	 */
	@ManyToOne(() => Notification, (_: Notification) => _.sent)
	@JoinColumn({ name: 'notification_id' })
	fromNotification: Notification;

	// Infomations
	/**
	 * Notification status
	 */
	@Column({ name: 'is_read' })
	isRead: boolean;

	/**
	 * Notification time record
	 */
	@Column({ name: 'read_at', type: 'timestamp with time zone' })
	readAt: Date;
}
