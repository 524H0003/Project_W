import { Column, Entity } from 'typeorm';
import { IFaculty } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';

@Entity({ name: 'FacultyUser' })
export class Faculty implements IFaculty {
	// Core Entity
	@Column(() => EventCreator, { prefix: false })
	user: EventCreator;

	// Infomations
	@Column()
	department: string;
}
