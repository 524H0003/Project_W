import { Column, Entity, OneToMany } from 'typeorm';
import { INotification, NotificationType } from './notification.model';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BlackBox } from 'app/utils/model.utils';
import { Reciever } from './reciever/reciever.entity';

/**
 * Notification entity
 */
@Entity({ name: 'Notification' })
export class Notification
	extends SensitiveInfomations
	implements INotification
{
	// Relationships
	/**
	 * Notification send to
	 */
	@OneToMany(() => Reciever, (_: Reciever) => _.from)
	sent: Reciever[];

	// Infomations
	/**
	 * Notification title
	 */
	@Column({ name: 'title', type: 'text' })
	title: string;

	/**
	 * Notification content
	 */
	@Column({ name: 'content', type: 'text' })
	content: string;

	/**
	 * Notification type
	 */
	@Column({
		name: 'notification_type',
		type: 'enum',
		enum: NotificationType,
		enumName: 'notification_type',
	})
	type: NotificationType;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
