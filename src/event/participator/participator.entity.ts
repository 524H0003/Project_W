import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipator,
} from './participator.model';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Event } from 'event/event.entity';
import { Student } from 'university/student/student.entity';

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
