import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';

/**
 * Student entity
 */
@Entity({ name: 'Student' })
export class Student implements IStudent {
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
			n = new User({ email, password, fullName: from });
		if (n.hashedPassword) return n;
	}
}
