import { Field, ObjectType } from '@nestjs/graphql';
import { Employee } from 'employee/employee.entity';
import { Student } from 'student/student.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { BlackBox } from 'utils/model.utils';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { IEnterprise } from './enterprise.model';

@ObjectType()
@Entity({ name: 'Enterprise' })
export class Enterprise extends SensitiveInfomations implements IEnterprise {
	// Relationships
	@OneToMany(() => Employee, (_: Employee) => _.enterprise)
	employees: Employee[];

	@OneToMany(() => Student, (_: Student) => _.currentEnterprise)
	students: Student[];

	// Infomations
	@Field()
	@Column({ name: 'name', type: 'text' })
	name: string;

	@Field()
	@Column({ name: 'description', type: 'text' })
	description: string;

	@Field()
	@Column({ name: 'industry', type: 'text' })
	industry: string;

	@Field()
	@Column({ name: 'image_path', type: 'text' })
	avatarPath: string;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
