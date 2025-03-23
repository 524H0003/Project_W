import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { Notification } from 'notification/notification.entity';
import { IRecieverEntity } from './reciever.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IRecieverInfoKeys } from 'build/models';
import { Field, ObjectType } from '@nestjs/graphql';
import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Reciever entity
 */
@ObjectType()
@CacheControl({ maxAge: (1).m2s })
@Entity({ name: 'UserNotification' })
export class Reciever extends GeneratedId implements IRecieverEntity {
	/**
	 * Initiate reciever
	 * @param {NonFunctionProperties<IRecieverEntity>} input - entity input
	 */
	constructor(input: NonFunctionProperties<IRecieverEntity>) {
		super();
		if (!input || !Object.keys(input)) return;

		Object.assign(this, InterfaceCasting.quick(input, IRecieverInfoKeys));
		this.toUser = new User(input.toUser);
		this.fromNotification = new Notification(input.fromNotification);
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
	@Field() @Column({ name: 'is_read', default: false }) isRead: boolean;

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
