import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { ChildEntity, OneToMany } from 'typeorm';
import { IEventCreator } from './creator.model';

@ChildEntity()
export class EventCreator extends User implements IEventCreator {
	// Relationships
	@OneToMany(() => Event, (_: Event) => _.createdBy)
	createdEvents: Event[];
}
