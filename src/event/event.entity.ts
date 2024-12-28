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
import { IEventInfoKeys } from 'models';
import { InterfaceCasting } from 'app/utils/utils';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';

/**
 * Event entity
 */
@ObjectType()
@Entity({ name: 'Event' })
export class Event extends SensitiveInfomations implements IEventEntity {
	/**
	 * @ignore
	 */
	constructor(payload: IEventInfo) {
		super();

		if (payload) {
			Object.assign(this, InterfaceCasting.quick(payload, IEventInfoKeys));
		}
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
	@Field()
	@Column({ name: 'title', type: 'text' })
	title: string;

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
	@Field()
	@Column({ name: 'location', type: 'text' })
	location: string;

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
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

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
			).toISOString(),
			endDate: new Date(
				`${(10).random + 1}/${(20).random + 2}/20${(90).random + 3}`,
			).toISOString(),
			applicationDeadline: new Date(
				`${(10).random + 1}/${(20).random + 2}/20${(90).random + 3}`,
			).toISOString(),
			requiredSkills: '',
		});
	}
}

@InputType()
export class EventAssign implements IEventInfo {
	@Field() title: string;
	@Field() startDate: Date;
	@Field() endDate: Date;
	@Field({ nullable: true }) applicationDeadline: Date;
	@Field() positionsAvailable: number;
	@Field() maxParticipants: number;
	@Field() location: string;
	@Field({ nullable: true, defaultValue: '' }) description: string;
	@Field({ nullable: true, defaultValue: EventType['Internship'] })
	type: EventType;
	@Field({ nullable: true, defaultValue: EventStatus['Draft'] })
	status: EventStatus;
	@Field(() => JSON, { nullable: true, defaultValue: '' })
	additionalFields: object;
	@Field({ nullable: true, defaultValue: '' }) requiredSkills: string;
}

@InputType()
export class EventUpdate implements IEventInfo {
	@Field({ nullable: true }) title: string;
	@Field({ nullable: true }) startDate: Date;
	@Field({ nullable: true }) endDate: Date;
	@Field({ nullable: true }) applicationDeadline: Date;
	@Field({ nullable: true }) positionsAvailable: number;
	@Field({ nullable: true }) maxParticipants: number;
	@Field({ nullable: true }) location: string;
	@Field({ nullable: true }) description: string;
	@Field({ nullable: true })
	type: EventType;
	@Field({ nullable: true })
	status: EventStatus;
	@Field(() => JSON, { nullable: true })
	additionalFields: object;
	@Field({ nullable: true }) requiredSkills: string;
	@Field({ nullable: false }) id: string;
}
