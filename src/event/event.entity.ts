import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
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

/**
 * Event entity
 */
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
	@ManyToMany(() => EventTag, { onDelete: 'CASCADE' })
	@JoinTable({ name: 'EventTag' })
	tags: EventTag[];

	// Infomations
	/**
	 * Event's description
	 */
	@Column({ name: 'description', type: 'text' })
	description: string;

	/**
	 * Event's title
	 */
	@Column({ name: 'title', type: 'text' })
	title: string;

	/**
	 * Event's maximum participator
	 */
	@Column({ name: 'max_participants', type: 'int4' })
	maxParticipants: number;

	/**
	 * Event's available position
	 */
	@Column({ name: 'positions_available', type: 'int4' })
	positionsAvailable: number;

	/**
	 * Event's status
	 */
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
	@Column({ name: 'location', type: 'text' })
	location: string;

	/**
	 * Event's start date
	 */
	@Column({ name: 'start_date', type: 'timestamp with time zone' })
	startDate: Date;

	/**
	 * Event's end date
	 */
	@Column({ name: 'end_date', type: 'timestamp with time zone' })
	endDate: Date;

	/**
	 * Application deadline
	 */
	@Column({ name: 'application_deadline', type: 'date' })
	applicationDeadline: Date;

	/**
	 * Event's required skills
	 */
	@Column({ name: 'required_skills', type: 'text' })
	requiredSkills: string;

	/**
	 * Addition fields
	 */
	@Column({ name: 'additional_fields', type: 'jsonb' })
	additionalFields: any;

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
			positionsAvailable: (30).random,
			status: EventStatus['Draft'],
			maxParticipants: 30 + (20).random,
			location: (30).string,
			startDate: new Date('1/1/111'),
			endDate: new Date('1/1/111'),
			applicationDeadline: new Date('1/1/11'),
			requiredSkills: '',
			additionalFields: '',
		});
	}
}
