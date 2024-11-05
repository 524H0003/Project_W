import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudentInfo, IStudentEntity } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserKeys,
	IStudentInfoKeys,
	IUserAuthenticationKeys,
} from 'models';
import { IUserSignUp } from 'user/user.model';

/**
 * Student entity
 */
@Entity({ name: 'Student' })
export class Student implements IStudentEntity {
	/**
	 * Create student entity with infomations
	 */
	constructor(payload: IStudentInfo & IUserSignUp) {
		if (payload) {
			this.user = new User(
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserKeys,
				]),
			);
			Object.assign(this, InterfaceCasting.quick(payload, IStudentInfoKeys));
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => User, { prefix: false })
	user: User;

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
	@Column({ name: 'major', default: '' })
	major: string;

	/**
	 * Student's skills
	 */
	@Column({ name: 'skills', type: 'text', default: '' })
	skills: string;

	/**
	 * Student graduation year
	 */
	@Column({ name: 'graduation_year', nullable: true })
	graduationYear: number;

	/**
	 * Student enrollment year
	 */
	@Column({ name: 'enrollment_year' })
	enrollmentYear: number;

	/**
	 * @ignore
	 */
	static test(from: string, options?: { email?: string; password?: string }) {
		const {
				email = `5${(7).numeric}@student.tdtu.edu.vn`,
				password = (16).string + '!!',
			} = options || {},
			user = User.test(from, { email, password });
		if (user.hashedPassword)
			return new Student({
				major: (3).string,
				graduationYear: (20).random,
				enrollmentYear: (20).random,
				skills: (3).string,
				...user.base,
				...user,
				password,
			});
	}
}
