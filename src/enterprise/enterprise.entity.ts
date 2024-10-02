import { Field, ObjectType } from '@nestjs/graphql';
import { Event } from 'event/event.entity';
import { Faculty } from 'faculty/faculty.entity';
import { Internship } from 'internship/internship.entity';
import { ChildEntity, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'user/user.entity';
import { IEnterprise } from './enterprise.model';

@ObjectType()
@ChildEntity()
export class Enterprise extends User implements IEnterprise {
	// Relationships
	@OneToMany(() => Internship, (_: Internship) => _.enterprise)
	internships: Internship[];

	@OneToMany(() => Event, (_: Event) => _.createdBy)
	events: Event[];

	@ManyToOne(() => Faculty, (_: Faculty) => _.enterprises)
	faculty: Faculty;
	// Infomations
	@Field()
	@Column()
	website: string;
}
