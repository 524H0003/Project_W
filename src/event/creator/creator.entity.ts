import { Column, Entity, OneToMany } from 'typeorm';
import { IEventCreator } from './creator.model';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';

/**
 * Event creator model
 */
@Entity({ name: 'EventCreator' })
export class EventCreator implements IEventCreator {
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
	@OneToMany(() => Event, (_: Event) => _.createdBy)
	createdEvents: Event[];
}
