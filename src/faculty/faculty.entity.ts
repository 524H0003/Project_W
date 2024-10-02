import { Enterprise } from 'enterprise/enterprise.entity';
import { Student } from 'student/student.entity';
import { ChildEntity, OneToMany } from 'typeorm';
import { User } from 'user/user.entity';
import { IFaculty } from './faculty.model';

@ChildEntity()
export class Faculty extends User implements IFaculty {
	// Relationships
	@OneToMany(() => Enterprise, (_: Enterprise) => _.faculty)
	enterprises: Enterprise[];

	@OneToMany(() => Student, (_: Student) => _.faculty)
	students: Student[];
}
