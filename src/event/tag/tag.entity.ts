import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToMany } from 'typeorm';
import { ITag } from './tag.model';
import { BlackBox } from 'app/utils/model.utils';
import { Event } from 'event/event.entity';

/**
 * Tag entity
 */
@Entity({ name: 'Tag' })
export class EventTag extends SensitiveInfomations implements ITag {
	// Relationships
	/**
	 * Tag to event
	 */
	@ManyToMany(() => Event)
	toEvents: Event[];

	// Infomations
	/**
	 * Tag's name
	 */
	@Column({ name: 'name', type: 'text' })
	name: string;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
