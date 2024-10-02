import { Enterprise } from 'enterprise/enterprise.entity';
import { EventType } from 'eventType/eventType.entity';
import { Student } from 'student/student.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { EventStatus, IEvent } from './event.model';

@Entity()
export class Event extends SensitiveInfomations implements IEvent {
	// Relationships
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.events)
	createdBy: Enterprise;

	@ManyToMany(() => Student, (_: Student) => _.careEvents)
	@JoinTable()
	watchingBy: Student[];

	@ManyToOne(() => EventType, (_) => _.events)
	eventType: EventType;

	// Infomations
	@Column({ type: 'text' })
	description: string;

	@Column()
	title: string;

	@Column({ type: 'enum', enum: EventStatus, default: EventStatus.PENDING })
	status: EventStatus;

	@Column()
	maxParticipants: number;

	@Column()
	positionsAvaliable: number;

	@Column()
	location: string;

	// Time Record
	@Column()
	startDate: Date;

	@Column()
	endDate: Date;
}
