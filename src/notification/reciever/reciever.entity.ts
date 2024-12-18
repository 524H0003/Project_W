import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { Notification } from 'notification/notification.entity';
import { IRecieverEntity, IRecieverInfo } from './reciever.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IRecieverInfoKeys } from 'models';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

/**
 * Reciever entity
 */
@ObjectType()
@Entity({ name: 'UserNotification' })
export class Reciever extends SensitiveInfomations implements IRecieverEntity {
	/**
	 * @ignore
	 */
	constructor(payload: IRecieverInfo) {
		super();

		if (payload) {
			Object.assign(this, InterfaceCasting.quick(payload, IRecieverInfoKeys));
		}
	}

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
	@Field()
	@Column({ name: 'is_read', default: false })
	isRead: boolean;

	/**
	 * Notification time record
	 */
	@Field({ nullable: true })
	@Column({
		name: 'read_at',
		type: 'timestamp with time zone',
		nullable: true,
		default: null,
	})
	readAt: Date;
}

@InputType()
export class RecieverAssign {
	@Field() notificationId: string;
	@Field() userId: string;
}

@InputType()
export class RecieverAssignMany {
	@Field() notificationId: string;
	@Field(() => [String]) usersId: string[];
}
