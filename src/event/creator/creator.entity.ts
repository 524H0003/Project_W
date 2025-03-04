import { Column, Entity, OneToMany } from 'typeorm';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { IEventCreatorEntity } from './creator.model';
import { BaseEntity, NonFunctionProperties } from 'app/utils/typeorm.utils';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator extends BaseEntity implements IEventCreatorEntity {
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
	@Column(() => User, { prefix: false }) user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.eventCreatedBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * Get entity id
	 */
	get id(): string {
		return this.user.baseUser.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ user });
	}
}
