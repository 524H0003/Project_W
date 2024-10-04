import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { EventStatus, EventType, IEvent } from './event.model';
import { EventParticipator } from './participator/participator.entity';
import { EventCreator } from './creator/creator.entity';
import { File } from 'file/file.entity';

@Entity({ name: 'Event' })
export class Event extends SensitiveInfomations implements IEvent {
	// Relationships
	@ManyToOne(() => EventCreator, (_: EventCreator) => _.createdEvents)
	@JoinColumn({ name: 'creator_id' })
	createdBy: EventCreator;

	@OneToMany(() => EventParticipator, (_: EventParticipator) => _.from)
	participators: EventParticipator[];

	@OneToMany(() => File, (_: File) => _.atEvent)
	documents: File[];

	// Infomations
	@Column({ name: 'description', type: 'text' })
	description: string;

	@Column({ name: 'title', type: 'text' })
	title: string;

	@Column({ name: 'max_participants', type: 'int4' })
	maxParticipants: number;

	@Column({ name: 'positions_available', type: 'int4' })
	positionsAvailable: number;

	@Column({
		name: 'status',
		type: 'enum',
		enum: EventStatus,
		default: EventStatus.draft,
		enumName: 'event_status',
	})
	status: EventStatus;

	@Column({
		name: 'event_type',
		type: 'enum',
		enum: EventType,
		enumName: 'event_type',
		default: EventType.internship,
	})
	type: EventType;

	@Column({ name: 'location', type: 'text' })
	location: string;

	@Column({ name: 'start_date', type: 'timestamp with time zone' })
	startDate: Date;

	@Column({ name: 'end_date', type: 'timestamp with time zone' })
	endDate: Date;

	@Column({ name: 'application_deadline', type: 'date' })
	applicationDeadline: Date;

	@Column({ name: 'required_skills', type: 'text' })
	requiredSkills: string;

	@Column({ name: 'additional_fields', type: 'jsonb' })
	additionalFields: any;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
