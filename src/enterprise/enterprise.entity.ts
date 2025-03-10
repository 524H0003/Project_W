import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { Column, Entity, OneToMany } from 'typeorm';
import { IEnterpriseEntity } from './enterprise.model';
import { Employee } from 'enterprise/employee/employee.entity';
import { Student } from 'university/student/student.entity';
import { BaseUser } from 'app/app.entity';
import { BaseEntity, NonFunctionProperties } from 'app/utils/typeorm.utils';

/**
 * Enterprise entity
 */
@ObjectType()
@Entity({ name: 'Enterprise' })
export class Enterprise extends BaseEntity implements IEnterpriseEntity {
	/**
	 * Create enterprise with infomations
	 * @param {NonFunctionProperties<IEnterpriseEntity>} payload - the infomations
	 */
	constructor(payload: NonFunctionProperties<IEnterpriseEntity>) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Core Entity
	@Column(() => BaseUser, { prefix: false }) baseUser: BaseUser;

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
	@Column({ name: 'description', type: 'text', default: '' })
	description: string;

	/**
	 * Enterprise's industry
	 */
	@Field() @Column({ name: 'industry', type: 'text' }) industry: string;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string) {
		return new Enterprise({
			description: (20).string,
			industry: (20).string,
			baseUser: { email: (30).string + '@lmao.uk', name: from },
		});
	}

	/**
	 * Get user's id
	 * @return {string}
	 */
	get id(): string {
		return this.baseUser.id;
	}
}
