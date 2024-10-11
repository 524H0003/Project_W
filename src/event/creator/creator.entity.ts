import { Column, Entity, OneToMany } from 'typeorm';
import { IEventCreator } from './creator.model';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';

@Entity({ name: 'EventCreator' })
export class EventCreator implements IEventCreator {
	// Core Entity
	@Column(() => User, { prefix: false })
	user: User;

	// Relationships
	@OneToMany(() => Event, (_: Event) => _.createdBy)
	createdEvents: Event[];
}
