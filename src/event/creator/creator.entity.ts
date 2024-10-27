import { Column, Entity, OneToMany } from 'typeorm';
import { IEventCreator } from './creator.model';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator implements IEventCreator {
	/**
	 * Create event creator entity with infomations
	 * @param {IEventCreator} payload - the infomations
	 */
	constructor(payload: IEventCreator) {
		Object.assign(this, payload);
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => User, { prefix: false })
	user: User;

	// Relationships
	/**
	 * Created events
	 */
	@OneToMany(() => Event, (_: Event) => _.createdBy, { nullable: true })
	createdEvents: Event[];

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string, options?: { user?: User }) {
		const { user = User.test(from) } = options || {};
		return new EventCreator({ user, createdEvents: [] });
	}
}
