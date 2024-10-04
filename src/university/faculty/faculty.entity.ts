import { ChildEntity, Column } from 'typeorm';
import { IFaculty } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';

@ChildEntity()
export class Faculty extends EventCreator implements IFaculty {
	// Infomations
	@Column()
	department: string;
}
