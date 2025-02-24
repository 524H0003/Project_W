import { Column, Entity } from 'typeorm';
import { IFacultyEntity } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';
import { IsString } from 'class-validator';
import { BaseEntity, NonFunctionProperties } from 'app/utils/typeorm.utils';

/**
 * Faculty entity
 */
@Entity({ name: 'FacultyUser' })
export class Faculty extends BaseEntity implements IFacultyEntity {
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
	@Column(() => EventCreator, { prefix: false }) eventCreator: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column() @IsString() department: string;

	// Methods
	/**
	 * Get entity id
	 */
	get id(): string {
		return this.eventCreator.id;
	}

	static test(from: string, options?: { department?: string }) {
		const { department = (10).string } = options || {},
			eventCreator = EventCreator.test(from);
		return new Faculty({ department, eventCreator });
	}
}
