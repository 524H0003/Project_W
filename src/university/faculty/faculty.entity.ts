import { Column, Entity } from 'typeorm';
import { IFaculty } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';

/**
 * Faculty entity
 */
@Entity({ name: 'FacultyUser' })
export class Faculty implements IFaculty {
	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => EventCreator, { prefix: false })
	user: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column()
	department: string;
}
