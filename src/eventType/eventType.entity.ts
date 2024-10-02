import { Event } from 'event/event.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { IEventType } from './eventType.model';

@Entity()
export class EventType extends SensitiveInfomations implements IEventType {
	// Infomations
	@Column()
	name: string;

	// Relationships
	@OneToMany(() => Event, (_) => _.eventType)
	events: Event[];
}
