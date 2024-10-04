import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Student } from 'university/student/student.entity';
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
