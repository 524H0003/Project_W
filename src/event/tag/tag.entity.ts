import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BlackBox } from 'app/utils/model.utils';
import { Event } from 'event/event.entity';
import { ITagEntity, ITagInfo } from './tag.model';
import { InterfaceCasting } from 'app/utils/utils';
import { ITagInfoKeys } from 'build/models';
import { Field, InputType, ObjectType } from '@nestjs/graphql';

/**
 * Tag entity
 */
@ObjectType()
@Entity({ name: 'Tag' })
export class EventTag extends SensitiveInfomations implements ITagEntity {
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
	@Field(() => [Event], { nullable: true })
	@ManyToMany(() => Event, (_: Event) => _.tags, { nullable: true })
	@JoinTable({ name: 'tags_table' })
	toEvents: Event[];

	// Infomations
	/**
	 * Tag's name
	 */
	@Field()
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

@InputType()
export class EventTagAssign implements ITagInfo {
	@Field() name: string;
}

@InputType()
export class EventTagAttach implements ITagInfo {
	@Field() name: string;
	@Field() eventId: string;
}
