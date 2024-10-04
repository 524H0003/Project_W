import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { File } from 'file/file.entity';
import {
	ChildEntity,
	Column,
	Entity,
	JoinColumn,
	ManyToOne,
	OneToMany,
} from 'typeorm';
import { Student } from 'university/student/student.entity';
import { User } from 'user/user.entity';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	EventStatus,
	EventType,
	IEvent,
	IEventCreator,
	IEventParticipator,
} from './event.model';

@ChildEntity()
export class EventCreator extends User implements IEventCreator {
	// Relationships
	@OneToMany(() => Event, (_: Event) => _.createdBy)
	createdEvents: Event[];
}

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

@Entity({ name: 'EventParticipation' })
export class EventParticipator
	extends SensitiveInfomations
	implements IEventParticipator
{
	// Relationships
	@ManyToOne(() => Event, (_: Event) => _.participators)
	@JoinColumn({ name: 'event_id' })
	from: Event;

	@ManyToOne(() => Student, (_: Student) => _.participatedEvents)
	@JoinColumn({ name: 'user_id' })
	participatedBy: Student;

	// Infomations
	@Column({ name: 'attendance' })
	isAttended: boolean;

	@Column({ name: 'registered_at', type: 'timestamp with time zone' })
	registeredAt: Date;

	@Column({ name: 'interview_time', type: 'timestamp with time zone' })
	interviewAt: Date;

	@Column({ name: 'interview_notes', type: 'text' })
	interviewNote: string;

	@Column({ name: 'additional_data', type: 'jsonb' })
	additionalData: any;

	@Column({
		name: 'status',
		type: 'enum',
		enum: EventParticipatorStatus,
		enumName: 'participation_status',
	})
	status: EventParticipatorStatus;

	@Column({
		name: 'role',
		type: 'enum',
		enum: EventParticipatorRole,
		enumName: 'participation_role',
	})
	role: EventParticipatorRole;
}
