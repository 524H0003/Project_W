import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipator,
} from './participator.model';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';

/**
 * Event participator entity
 */
@Entity({ name: 'EventParticipation' })
export class EventParticipator
	extends SensitiveInfomations
	implements IEventParticipator
{
	// Relationships
	/**
	 * Participator from event
	 */
	@ManyToOne(() => Event, (_: Event) => _.participators)
	@JoinColumn({ name: 'event_id' })
	from: Event;

	/**
	 * The user participate event
	 */
	@ManyToOne(() => User, (_: User) => _.participatedEvents)
	@JoinColumn({ name: 'user_id' })
	participatedBy: User;

	// Infomations
	/**
	 * If participator attended
	 */
	@Column({ name: 'attendance' })
	isAttended: boolean;

	/**
	 * Participator register time record
	 */
	@Column({ name: 'registered_at', type: 'timestamp with time zone' })
	registeredAt: Date;

	/**
	 * Participator interview time record
	 */
	@Column({ name: 'interview_time', type: 'timestamp with time zone' })
	interviewAt: Date;

	/**
	 * Participator interview note
	 */
	@Column({ name: 'interview_notes', type: 'text' })
	interviewNote: string;

	/**
	 * Addition data
	 */
	@Column({ name: 'additional_data', type: 'jsonb' })
	additionalData: any;

	/**
	 * The status in event
	 */
	@Column({
		name: 'status',
		type: 'enum',
		enum: EventParticipatorStatus,
		enumName: 'participation_status',
	})
	status: EventParticipatorStatus;

	/**
	 * The role in event
	 */
	@Column({
		name: 'role',
		type: 'enum',
		enum: EventParticipatorRole,
		enumName: 'participation_role',
	})
	role: EventParticipatorRole;
}
