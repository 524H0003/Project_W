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
import { INotificationInfoKeys } from 'build/models';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Notification entity
 */
@ObjectType()
@Entity({ name: 'Notification' })
export class Notification
	extends SensitiveInfomations
	implements INotificationEntity
{
	/**
	 * Initiate notification entity
	 * @param {INotificationInfo} input - entity input
	 */
	constructor(input: INotificationInfo) {
		super();

		if (input) {
			Object.assign(this, InterfaceCasting.quick(input, INotificationInfoKeys));
		}
	}

	// Relationships
	/**
	 * Notification send to
	 */
	@OneToMany(() => Reciever, (_: Reciever) => _.fromNotification, {
		cascade: true,
	})
	sent: Reciever[];

	// Infomations
	/**
	 * Notification title
	 */
	@Column({ name: 'title', type: 'text' }) @Field() title: string;

	/**
	 * Notification content
	 */
	@Column({ name: 'content', type: 'text' }) @Field() content: string;

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
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;

	// Methods
	static test(from: string) {
		return new Notification({
			title: from + (5).string,
			content: (30).string,
			type: NotificationType.participation,
		});
	}
}
