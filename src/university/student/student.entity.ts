import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';

/**
 * Student entity
 */
@Entity({ name: 'Student' })
export class Student implements IStudent {
	/**
	 * Create student entity with infomations
	 */
	constructor(payload: IStudent) {
		Object.assign(this, payload);
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
	@Column({ name: 'major' })
	major: string;

	/**
	 * Student's skills
	 */
	@Column({ name: 'skills', type: 'text' })
	skills: string;

	/**
	 * Student graduation year
	 */
	@Column({ name: 'graduation_year' })
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
			user = new User({ email, password, fullName: from });
		if (user.hashedPassword)
			return new Student({
				user,
				major: (3).string,
				graduationYear: (20).random,
				enrollmentYear: (20).random,
				skills: (3).string,
				currentEnterprise: null,
			});
	}
}
