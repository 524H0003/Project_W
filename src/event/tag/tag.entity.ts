import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BlackBox } from 'app/utils/model.utils';
import { Event } from 'event/event.entity';
import { ITagEntity, ITagInfo } from './tag.model';
import { InterfaceCasting } from 'app/utils/utils';
import { ITagInfoKeys } from 'models';

/**
 * Tag entity
 */
@Entity({ name: 'Tag' })
export class EventTag extends SensitiveInfomations implements ITagEntity {
	/**
	 * @ignore
	 */
	constructor(payload: ITagInfo) {
		super();

		if (payload) {
			Object.assign(this, InterfaceCasting.quick(payload, ITagInfoKeys));
		}
	}

	// Relationships
	/**
	 * Tag to event
	 */
	@ManyToMany(() => Event, (_: Event) => _.tags, { nullable: true })
	@JoinTable({ name: 'tags_table' })
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

	// Methods
	static test(from: string) {
		return new EventTag({ name: from + (5).string });
	}
}
