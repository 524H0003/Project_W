import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import { StudentService } from './student.service';

@Entity({ name: 'Student' })
export class Student implements IStudent {
	// Core Entity
	@Column(() => User, { prefix: false })
	user: User;

	// Relationships
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.students)
	@JoinColumn({ name: 'current_enterprise_id' })
	currentEnterprise: Enterprise;

	// Infomations
	@Column({ name: 'major' })
	major: string;

	@Column({ name: 'skills', type: 'text' })
	skills: string;

	@Column({ name: 'graduation_year' })
	graduationYear: number;

	@Column({ name: 'enrollment_year' })
	enrollmentYear: number;

	static test(from: string, options?: { email?: string; password?: string }) {
		const {
				email = `5${(7).numeric}@student.tdtu.edu.vn`,
				password = StudentService.defaultPassword,
			} = options || {},
			n = new User({ email, password, fullName: from });
		if (n.hashedPassword) return n;
	}
}
