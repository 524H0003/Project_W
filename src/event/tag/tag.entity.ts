import {
	NonFunctionProperties,
	SensitiveInfomations,
} from 'app/utils/typeorm.utils';
import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BlackBox } from 'app/utils/model.utils';
import { Event } from 'event/event.entity';
import { ITagEntity } from './tag.model';
import { Field, ObjectType } from '@nestjs/graphql';

/**
 * Tag entity
 */
@ObjectType()
@Entity({ name: 'Tag' })
export class EventTag extends SensitiveInfomations implements ITagEntity {
	/**
	 * Initiate event tag
	 * @param {ITagInfo} input - entity input
	 */
	constructor(input: NonFunctionProperties<ITagEntity>) {
		super();

		if (input) Object.assign(this, input);
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
	@Field() @Column({ name: 'name', type: 'text' }) name: string;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;

	// Methods
	static test(from: string) {
		return new EventTag({ name: from + (5).string });
	}
}
