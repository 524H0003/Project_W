import {
	Column,
	Entity,
	JoinColumn,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { EventStatus, EventType, IEventEntity } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { File } from 'file/file.entity';
import { EventTag } from './tag/tag.entity';
import { BlackBox } from 'app/utils/model.utils';
import {
	NonFunctionProperties,
	SensitiveInfomations,
} from 'app/utils/typeorm.utils';
import { EventCreator } from './creator/creator.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';
import { InterfaceCasting } from 'app/utils/utils';
import { IEventInfoKeys } from 'build/models';

/**
 * Event entity
 */
@ObjectType()
@Entity({ name: 'Event' })
export class Event extends SensitiveInfomations implements IEventEntity {
	/**
	 * Initiate event entity
	 * @param {NonFunctionProperties<IEventEntity>} payload - entity input
	 */
	constructor(payload: NonFunctionProperties<IEventEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IEventInfoKeys));
		this.eventCreatedBy = new EventCreator(payload.eventCreatedBy);
		this.participators = payload.participators?.map(
			(i) => new EventParticipator(i),
		);
		this.documents = payload.documents?.map((i) => new File(i));
		this.tags = payload.tags?.map((i) => new EventTag(i));
	}

	// Relationships
	/**
	 * The event creator
	 */
	@ManyToOne(() => EventCreator, (_: EventCreator) => _.createdEvents, {
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'creator_id' })
	eventCreatedBy: EventCreator;

	/**
	 * Event's participators
	 */
	@OneToMany(() => EventParticipator, (_: EventParticipator) => _.fromEvent, {
		onDelete: 'CASCADE',
	})
	participators: EventParticipator[];

	/**
	 * Event's attached files
	 */
	@OneToMany(() => File, (_: File) => _.atEvent, { onDelete: 'CASCADE' })
	documents: File[];

	/**
	 * Event's tags
	 */
	@ManyToMany(() => EventTag, (_: EventTag) => _.toEvents, {
		onDelete: 'CASCADE',
	})
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
		const output = new Event({
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
			documents: [],
			tags: [],
			eventCreatedBy: null,
			participators: [],
		});

		delete output.eventCreatedBy;
		delete output.participators;
		delete output.documents;
		delete output.tags;

		return output;
	}
}
