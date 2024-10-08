import { ChildEntity, OneToMany } from 'typeorm';
import { IEventCreator } from './creator.model';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';

@ChildEntity()
export class EventCreator extends User implements IEventCreator {
	// Relationships
	@OneToMany(() => Event, (_: Event) => _.createdBy)
	createdEvents: Event[];
}
