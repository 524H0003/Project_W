import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import { IEnterprise, IEnterpriseAssign } from './enterprise.model';
import { Employee } from 'enterprise/employee/employee.entity';
import { Student } from 'university/student/student.entity';
import { BaseUser } from 'app/app.entity';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserInfoKeys, IEnterpriseInfoKeys } from 'models';

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
	constructor(payload: Omit<IEnterpriseAssign, 'signature'>) {
		super();

		if (payload) {
			const baseUsrInfo = InterfaceCasting.quick(
					payload!,
					IBaseUserInfoKeys,
				) as unknown as BaseUser,
				usrInfo = InterfaceCasting.quick(payload!, IEnterpriseInfoKeys);
			Object.assign(this, usrInfo);
			this.baseUser = baseUsrInfo;
		}
	}

	// Core Entity
	@Column(() => BaseUser, { prefix: false })
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
