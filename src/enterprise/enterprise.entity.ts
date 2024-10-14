import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, OneToMany } from 'typeorm';
import { IEnterprise } from './enterprise.model';
import { Employee } from 'enterprise/employee/employee.entity';
import { Student } from 'university/student/student.entity';

/**
 * Enterprise entity
 */
@ObjectType()
@Entity({ name: 'Enterprise' })
export class Enterprise extends SensitiveInfomations implements IEnterprise {
	/**
	 * Create enterprise with infomations
	 * @param {IEnterprise} payload - the infomations
	 */
	constructor(payload: Omit<IEnterprise, 'avatarPath'>) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	/**
	 * Enterprise's employees
	 */
	@OneToMany(() => Employee, (_: Employee) => _.enterprise)
	employees: Employee[];

	/**
	 * Enterprise's students
	 */
	@OneToMany(() => Student, (_: Student) => _.currentEnterprise)
	students: Student[];

	// Infomations
	/**
	 * Enterprise's name
	 */
	@Field()
	@Column({ name: 'name', type: 'text' })
	name: string;

	/**
	 * Enterprise's name
	 */
	@Field()
	@Column({ name: 'description', type: 'text' })
	description: string;

	/**
	 * Enterprise's industry
	 */
	@Field()
	@Column({ name: 'industry', type: 'text' })
	industry: string;

	/**
	 * Enterprise's avatar path
	 */
	@Field()
	@Column({
		name: 'image_path',
		type: 'text',
		default: 'defaultUser.server.jpg',
	})
	avatarPath: string;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string) {
		return new Enterprise({
			name: from,
			description: (20).string,
			industry: (20).string,
			employees: [],
			students: [],
		});
	}
}
