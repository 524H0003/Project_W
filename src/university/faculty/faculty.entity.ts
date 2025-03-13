import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { IFacultyEntity } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';
import { IsString } from 'class-validator';
import {
	NonFunctionProperties,
	SensitiveInfomations,
} from 'app/utils/typeorm.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { IFacultyInfoKeys } from 'build/models';

/**
 * Faculty entity
 */
@Entity({ name: 'FacultyUser' })
export class Faculty extends SensitiveInfomations implements IFacultyEntity {
	/**
	 * Initiate faculty object
	 */
	constructor(payload: NonFunctionProperties<IFacultyEntity>) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Core Entity
	/**
	 * Base event creator
	 */
	@OneToOne(() => EventCreator, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
	eventCreator: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column()
	@IsString()
	department: string;

	// Methods
	/**
	 * Entity base info
	 */
	get info() {
		return {
			...InterfaceCasting.quick(this, IFacultyInfoKeys),
			...this.eventCreator.user.info,
		};
	}

	/**
	 * Entity id
	 */
	// @ts-ignore
	get id() {
		return this.eventCreator.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { department?: string }) {
		const { department = (10).string } = options || {},
			eventCreator = EventCreator.test(from);
		return new Faculty({ department, eventCreator });
	}
}
