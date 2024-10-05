import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudent } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';

@ChildEntity()
export class Student extends User implements IStudent {
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
}