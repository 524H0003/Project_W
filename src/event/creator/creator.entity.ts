import { Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { IEventCreatorEntity } from './creator.model';
import {
	NonFunctionProperties,
	SensitiveInfomations,
} from 'app/utils/typeorm.utils';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator
	extends SensitiveInfomations
	implements IEventCreatorEntity
{
	/**
	 * Create event creator entity with infomations
	 * @param {NonFunctionProperties<IEventCreatorEntity>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IEventCreatorEntity>) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Core Entity
	/**
	 * Base user
	 */
	@OneToOne(() => User, { cascade: true }) @JoinColumn() user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.eventCreatedBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ user });
	}
}
