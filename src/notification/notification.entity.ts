import { Column, Entity, OneToMany } from 'typeorm';
import { INotification, NotificationType } from './notification.model';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BlackBox } from 'app/utils/model.utils';
import { Reciever } from './reciever/reciever.entity';

@Entity({ name: 'Notification' })
export class Notification
	extends SensitiveInfomations
	implements INotification
{
	// Relationships
	@OneToMany(() => Reciever, (_: Reciever) => _.from)
	sent: Reciever[];

	// Infomations
	@Column({ name: 'title', type: 'text' })
	title: string;

	@Column({ name: 'content', type: 'text' })
	content: string;

	@Column({
		name: 'notification_type',
		type: 'enum',
		enum: NotificationType,
		enumName: 'notification_type',
	})
	type: NotificationType;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
