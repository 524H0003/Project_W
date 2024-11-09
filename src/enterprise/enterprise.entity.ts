import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { IEnterprise, IEnterpriseAssign } from './enterprise.model';
import { Employee } from 'enterprise/employee/employee.entity';
import { Student } from 'university/student/student.entity';
import { BaseUser } from 'app/app.entity';
import { IBaseUser } from 'app/app.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserKeys, IEnterpriseAssignKeys } from 'models';

/**
 * Enterprise entity
 */
@ObjectType()
@Entity({ name: 'Enterprise' })
export class Enterprise extends BaseEntity implements IEnterprise {
	/**
	 * Create enterprise with infomations
	 * @param {IEnterprise} payload - the infomations
	 */
	constructor(payload: IEnterpriseAssign & IBaseUser) {
		super();

		if (payload) {
			const baseUsrInfo = InterfaceCasting.quick(
					payload!,
					IBaseUserKeys,
				) as unknown as BaseUser,
				usrInfo = InterfaceCasting.quick(payload!, IEnterpriseAssignKeys);
			Object.assign(this, usrInfo);
			this.user = baseUsrInfo;
		}
	}

	// Core Entity
	@Column(() => BaseUser, { prefix: false })
	user: BaseUser;

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
	@Field()
	@Column({ name: 'industry', type: 'text' })
	industry: string;

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
			email: (30).string + '@lmao.uk',
			signature: (10).string,
		});
	}
}
