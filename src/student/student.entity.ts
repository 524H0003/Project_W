import { Enterprise } from 'enterprise/enterprise.entity';
import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';

@ChildEntity()
export class Student extends User implements IStudent {
	// Relationships
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.students)
	@JoinColumn({ name: 'current_enterprise_id' })
	currentEnterprise: Enterprise;

	// Infomations
	@Column({ name: 'string' })
	major: string;

	@Column({ name: 'skills', type: 'text' })
	skills: string;

	@Column({ name: 'graduation_year' })
	graduationYear: number;

	@Column({ name: 'enrollment_year' })
	enrollmentYear: number;
}
