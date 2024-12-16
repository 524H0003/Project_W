import { Column, Entity, OneToMany } from 'typeorm';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BlackBox } from 'app/utils/model.utils';
import { Reciever } from './reciever/reciever.entity';
import {
	INotificationEntity,
	INotificationInfo,
	NotificationType,
} from './notification.model';
import { InterfaceCasting } from 'app/utils/utils';
import { INotificationInfoKeys } from 'models';
import { Field, InputType } from '@nestjs/graphql';

/**
 * Notification entity
 */
@Entity({ name: 'Notification' })
export class Notification
	extends SensitiveInfomations
	implements INotificationEntity
{
	/**
	 * @ignore
	 */
	constructor(payload: INotificationInfo) {
		super();

		if (payload) {
			Object.assign(
				this,
				InterfaceCasting.quick(payload, INotificationInfoKeys),
			);
		}
	}

	// Relationships
	/**
	 * Notification send to
	 */
	@OneToMany(() => Reciever, (_: Reciever) => _.fromNotification, {
		onDelete: 'CASCADE',
	})
	sent: Reciever[];

	// Infomations
	/**
	 * Notification title
	 */
	@Column({ name: 'title', type: 'text' })
	@Field()
	title: string;

	/**
	 * Notification content
	 */
	@Column({ name: 'content', type: 'text' })
	@Field()
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
	@Field(() => NotificationType)
	type: NotificationType;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

	// Methods
	static test(from: string) {
		return new Notification({
			title: from + (5).string,
			content: (30).string,
			type: NotificationType.participation,
		});
	}
}

@InputType()
export class NotificationAssign implements INotificationInfo {
	@Field() title: string;
	@Field() content: string;
	@Field() type: NotificationType;
}

@InputType()
export class NotificationUpdate implements INotificationInfo {
	@Field({ nullable: true }) title: string;
	@Field({ nullable: true }) content: string;
	@Field({ nullable: true }) type: NotificationType;
	@Field() id: string;
}
