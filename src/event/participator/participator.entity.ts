import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipatorEntiy,
	IEventParticipatorInfo,
} from './participator.model';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { InterfaceCasting } from 'app/utils/utils';
import { IEventParticipatorInfoKeys } from 'build/models';
import { Field, ObjectType } from '@nestjs/graphql';
import JSON from 'graphql-type-json';

/**
 * Event participator entity
 */
@ObjectType()
@Entity({ name: 'EventParticipation' })
export class EventParticipator
	extends SensitiveInfomations
	implements IEventParticipatorEntiy
{
	constructor(payload: IEventParticipatorInfo) {
		super();

		if (payload) {
			Object.assign(
				this,
				InterfaceCasting.quick(payload, IEventParticipatorInfoKeys),
			);
		}
	}

	// Relationships
	/**
	 * Participator from event
	 */
	@ManyToOne(() => Event, (_: Event) => _.participators)
	@JoinColumn({ name: 'event_id' })
	fromEvent: Event;

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
	@Field() @Column({ name: 'attendance', default: false }) isAttended: boolean;

	/**
	 * Participator register time record
	 */
	@Field()
	@Column({ name: 'registered_at', type: 'timestamp with time zone' })
	registeredAt: Date;

	/**
	 * Participator interview time record
	 */
	@Field({ nullable: true })
	@Column({
		name: 'interview_time',
		type: 'timestamp with time zone',
		nullable: true,
	})
	interviewAt: Date;

	/**
	 * Participator interview note
	 */
	@Field()
	@Column({ name: 'interview_notes', type: 'text', default: '' })
	interviewNote: string;

	/**
	 * Addition data
	 */
	@Field(() => JSON)
	@Column({ name: 'additional_data', default: {}, type: 'jsonb' })
	additionalData: object;

	/**
	 * The status in event
	 */
	@Field()
	@Column({
		name: 'status',
		type: 'enum',
		enum: EventParticipatorStatus,
		enumName: 'participation_status',
		default: EventParticipatorStatus.registered,
	})
	status: EventParticipatorStatus;

	/**
	 * The role in event
	 */
	@Field()
	@Column({
		name: 'role',
		type: 'enum',
		enum: EventParticipatorRole,
		enumName: 'participation_role',
		default: EventParticipatorRole.attendee,
	})
	role: EventParticipatorRole;
}
