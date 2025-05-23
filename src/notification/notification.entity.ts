import { Column, Entity, OneToMany } from 'typeorm';
import { BlackBox } from 'app/utils/model.utils';
import { Reciever } from './reciever/reciever.entity';
import {
	NotificationType,
	type INotificationEntity,
	type INotificationInfo,
} from './notification.model';
import { INotificationInfoKeys } from 'build/models';
import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratedId } from 'app/typeorm/typeorm.utils';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Notification entity
 */
@ObjectType()
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'Notification' })
export class Notification extends GeneratedId implements INotificationEntity {
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
		onDelete: 'CASCADE',
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
