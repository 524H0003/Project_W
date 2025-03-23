import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EventParticipatorRole,
	EventParticipatorStatus,
	IEventParticipatorEntiy,
} from './participator.model';
import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { Event } from 'event/event.entity';
import { User } from 'user/user.entity';
import { Field, ObjectType } from '@nestjs/graphql';
import GQLJSON from 'graphql-type-json';
import { InterfaceCasting } from 'app/utils/utils';
import { IEventParticipatorInfoKeys } from 'build/models';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Event participator entity
 */
@ObjectType()
@CacheControl({ maxAge: (1).m2s })
@Entity({ name: 'EventParticipation' })
export class EventParticipator
	extends GeneratedId
	implements IEventParticipatorEntiy
{
	/**
	 * Initiate event participator entity
	 * @param {NonFunctionProperties<IEventParticipatorEntiy>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IEventParticipatorEntiy>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(
			this,
			InterfaceCasting.quick(payload, IEventParticipatorInfoKeys),
		);
		this.fromEvent = new Event(payload.fromEvent);
		this.participatedBy = new User(payload.participatedBy);
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
	@Field(() => GQLJSON)
	@Column({ name: 'additional_data', default: {}, type: 'jsonb' })
	additionalData: JSON;

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
