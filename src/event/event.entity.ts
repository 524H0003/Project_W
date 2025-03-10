import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import {
	EventStatus,
	EventType,
	IEventEntity,
	IEventInfo,
} from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { File } from 'file/file.entity';
import { EventTag } from './tag/tag.entity';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator/creator.entity';
import { IEventInfoKeys } from 'build/models';
import { InterfaceCasting } from 'app/utils/utils';
import { Field, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';

/**
 * Event entity
 */
@ObjectType()
@Entity({ name: 'Event' })
export class Event extends SensitiveInfomations implements IEventEntity {
	/**
	 * Initiate event entity
	 * @param {IEventInfo} input - entity input
	 */
	constructor(input: IEventInfo) {
		super();

		if (input)
			Object.assign(this, InterfaceCasting.quick(input, IEventInfoKeys));
	}

	// Relationships
	/**
	 * The event creator
	 */
	@ManyToOne(() => EventCreator, (_: EventCreator) => _.createdEvents, {
		cascade: true,
	})
	@JoinColumn({ name: 'creator_id' })
	eventCreatedBy: EventCreator;

	/**
	 * Event's participators
	 */
	@OneToMany(() => EventParticipator, (_: EventParticipator) => _.fromEvent, {
		cascade: true,
	})
	participators: EventParticipator[];

	/**
	 * Event's attached files
	 */
	@OneToMany(() => File, (_: File) => _.atEvent, { cascade: true })
	documents: File[];

	/**
	 * Event's tags
	 */
	@ManyToMany(() => EventTag, (_: EventTag) => _.toEvents, { cascade: true })
	tags: EventTag[];

	// Infomations
	/**
	 * Event's description
	 */
	@Field({ defaultValue: '' })
	@Column({ name: 'description', type: 'text' })
	description: string;

	/**
	 * Event's title
	 */
	@Field() @Column({ name: 'title', type: 'text' }) title: string;

	/**
	 * Event's maximum participator
	 */
	@Field()
	@Column({ name: 'max_participants', type: 'int4' })
	maxParticipants: number;

	/**
	 * Event's available position
	 */
	@Field()
	@Column({ name: 'positions_available', type: 'int4' })
	positionsAvailable: number;

	/**
	 * Event's status
	 */
	@Field(() => EventStatus, { defaultValue: EventStatus['Draft'] })
	@Column({
		name: 'status',
		type: 'enum',
		enum: EventStatus,
		default: EventStatus['Draft'],
		enumName: 'event_status',
	})
	status: EventStatus;

	/**
	 * Event's type
	 */
	@Field(() => EventType, { defaultValue: EventType['Internship'] })
	@Column({
		name: 'event_type',
		type: 'enum',
		enum: EventType,
		enumName: 'event_type',
		default: EventType['Internship'],
	})
	type: EventType;

	/**
	 * Event's location
	 */
	@Field() @Column({ name: 'location', type: 'text' }) location: string;

	/**
	 * Event's start date
	 */
	@Field()
	@Column({ name: 'start_date', type: 'timestamp with time zone' })
	startDate: Date;

	/**
	 * Event's end date
	 */
	@Field()
	@Column({ name: 'end_date', type: 'timestamp with time zone' })
	endDate: Date;

	/**
	 * Application deadline
	 */
	@Field()
	@Column({
		name: 'application_deadline',
		type: 'timestamp with time zone',
		nullable: true,
	})
	applicationDeadline: Date;

	/**
	 * Event's required skills
	 */
	@Field({ defaultValue: '' })
	@Column({ name: 'required_skills', type: 'text' })
	requiredSkills: string;

	/**
	 * Addition fields
	 */
	@Field(() => JSON)
	@Column({ name: 'additional_fields', default: {}, type: 'jsonb' })
	additionalFields?: object;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;

	// Methods
	static test(from: string) {
		return new Event({
			title: from + (5).string,
			description: (20).string,
			type: EventType['Workshop'],
			positionsAvailable: (30).random + 2,
			status: EventStatus['Draft'],
			maxParticipants: 32 + (20).random,
			location: (30).string,
			startDate: new Date(
				`${(10).random + 1}/${(20).random + 2}/20${(90).random + 3}`,
			),
			endDate: new Date(
				`${(10).random + 1}/${(20).random + 2}/20${(90).random + 3}`,
			),
			applicationDeadline: new Date(
				`${(10).random + 1}/${(20).random + 2}/20${(90).random + 3}`,
			),
			requiredSkills: '',
		});
	}
}
