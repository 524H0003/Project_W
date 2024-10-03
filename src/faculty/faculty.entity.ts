import { EventCreator } from 'event/event.entity';
import { ChildEntity, Column } from 'typeorm';
import { IFaculty } from './faculty.model';

@ChildEntity()
export class Faculty extends EventCreator implements IFaculty {
	// Infomations
	@Column()
	department: string;
}
