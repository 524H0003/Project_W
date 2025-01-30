import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudentInfo, IStudentEntity } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserInfoKeys,
	IStudentInfoKeys,
	IUserAuthenticationKeys,
} from 'build/models';
import { IUserSignUp } from 'user/user.model';

/**
 * Student entity
 */
@Entity({ name: 'Student' })
export class Student extends BaseEntity implements IStudentEntity {
	/**
	 * Create student entity with infomations
	 */
	constructor(payload: IStudentInfo & IUserSignUp) {
		super();

		if (payload) {
			this.user = new User(
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserInfoKeys,
				]),
			);
			Object.assign(this, InterfaceCasting.quick(payload, IStudentInfoKeys));
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => User, { prefix: false }) user: User;

	// Relationships
	/**
	 * Student current working enterprise
	 */
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.students)
	@JoinColumn({ name: 'current_enterprise_id' })
	currentEnterprise: Enterprise;

	// Infomations
	/**
	 * Student's major
	 */
	@Column({ name: 'major', default: '' }) major: string;

	/**
	 * Student's skills
	 */
	@Column({ name: 'skills', type: 'text', default: '' }) skills: string;

	/**
	 * Student graduation year
	 */
	@Column({ name: 'graduation_year', nullable: true }) graduationYear: number;

	/**
	 * Student enrollment year
	 */
	@Column({ name: 'enrollment_year' }) enrollmentYear: number;

	/**
	 * @ignore
	 */
	static async test(
		from: string,
		options?: { email?: string; password?: string },
	) {
		const { email = `5${(7).numeric}@student.tdtu.edu.vn` } = options || {},
			user = User.test(from, { email });
		if (await user.hashingPassword())
			return new Student({
				major: (3).string,
				graduationYear: (20).random,
				enrollmentYear: (20).random,
				skills: (3).string,
				...user.baseUser,
				...user,
			});
	}
}
