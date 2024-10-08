import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToMany } from 'typeorm';
import { ITag } from './tag.model';
import { BlackBox } from 'app/utils/model.utils';
import { Event } from 'event/event.entity';

@Entity({ name: 'Tag' })
export class EventTag extends SensitiveInfomations implements ITag {
	// Relationships
	@ManyToMany(() => Event)
	toEvents: Event[];

	// Infomations
	@Column({ name: 'name', type: 'text' })
	name: string;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
