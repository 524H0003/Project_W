import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { IReciever } from './reciever.model';
import { User } from 'user/user.entity';
import { Notification } from 'notification/notification.entity';

@Entity({ name: 'UserNotification' })
export class Reciever extends SensitiveInfomations implements IReciever {
	// Relationships
	@ManyToOne(() => User, (_: User) => _.recievedNotifications)
	@JoinColumn({ name: 'user_id' })
	to: User;

	@ManyToOne(() => Notification, (_: Notification) => _.sent)
	@JoinColumn({ name: 'notification_id' })
	from: Notification;

	// Infomations
	@Column({ name: 'is_read' })
	isRead: boolean;

	@Column({ name: 'read_at', type: 'timestamp with time zone' })
	readAt: Date;
}
