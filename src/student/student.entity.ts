import { Event } from 'event/event.entity';
import { Faculty } from 'faculty/faculty.entity';
import { Internship } from 'internship/internship.entity';
import { ChildEntity, Column, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';

@ChildEntity()
export class Student extends User implements IStudent {
	// Relationships
	@ManyToOne(() => Faculty, (_: Faculty) => _.students)
	faculty: Faculty;

	@OneToMany(() => Internship, (_: Internship) => _.trainee)
	internships: Internship[];

	@ManyToMany(() => Event, (_: Event) => _.watchingBy)
	careEvents: Event[];

	// Infomations
	@Column()
	code: string;

	@Column()
	class: string;

	@Column()
	yearOfStudy: number;

	@Column({ default: true })
	isMale: boolean;
}
