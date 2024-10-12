import {
	Column,
	Entity,
	JoinColumn,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { EventStatus, EventType, IEvent } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { File } from 'file/file.entity';
import { EventTag } from './tag/tag.entity';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator/creator.entity';

/**
 * Event entity
 */
@Entity({ name: 'Event' })
export class Event extends SensitiveInfomations implements IEvent {
	// Relationships
	/**
	 * The event creator
	 */
	@ManyToOne(() => EventCreator, (_: EventCreator) => _.createdEvents)
	@JoinColumn({ name: 'creator_id' })
	createdBy: EventCreator;

	/**
	 * Event's participators
	 */
	@OneToMany(() => EventParticipator, (_: EventParticipator) => _.from)
	participators: EventParticipator[];

	/**
	 * Event's attached files
	 */
	@OneToMany(() => File, (_: File) => _.atEvent)
	documents: File[];

	/**
	 * Event's tags
	 */
	@ManyToMany(() => EventTag)
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
		default: EventStatus.draft,
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
		default: EventType.internship,
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
}
