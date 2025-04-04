import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { IEnterpriseEntity } from './enterprise.model';
import { Employee } from 'enterprise/employee/employee.entity';
import { Student } from 'university/student/student.entity';
import { NonFunctionProperties, ParentId } from 'app/typeorm/typeorm.utils';
import { IEnterpriseInfoKeys } from 'build/models';
import { BaseUser } from 'user/base/baseUser.entity';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Enterprise entity
 */
@ObjectType()
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'Enterprise' })
export class Enterprise extends ParentId implements IEnterpriseEntity {
	/**
	 * Create enterprise with infomations
	 * @param {NonFunctionProperties<IEnterpriseEntity>} payload - the infomations
	 */
	constructor(payload: NonFunctionProperties<IEnterpriseEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IEnterpriseInfoKeys));
		this.baseUser = new BaseUser(payload.baseUser);
		this.employees = payload.employees?.map((i) => new Employee(i));
		this.students = payload.students?.map((i) => new Student(i));
	}

	// Core Entity
	@OneToOne(() => BaseUser, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	baseUser: BaseUser;

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
	 * Get parent's id
	 */
	get pid() {
		return this.baseUser.id;
	}
}
