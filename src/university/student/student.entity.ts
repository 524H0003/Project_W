import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudentInfo, IStudentEntity } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import { InterfaceCasting } from 'app/utils/utils';
import { IStudentInfoKeys } from 'build/models';
import { IUserInfo } from 'user/user.model';
import { IBaseUserInfo } from 'app/app.model';
import { NonFunctionProperties, ParentId } from 'app/utils/typeorm.utils';

/**
 * Student entity
 */
@Entity({ name: 'Student' })
export class Student extends ParentId implements IStudentEntity {
	/**
	 * Create student entity with infomations
	 * @param {NonFunctionProperties<IStudentEntity>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IStudentEntity>) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Core Entity
	/**
	 * Student user infomations
	 */
	@OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
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

	// Methods
	/**
	 * A function return user's public infomations
	 */
	get info(): IStudentInfo & IUserInfo & IBaseUserInfo {
		return {
			...InterfaceCasting.quick(this, IStudentInfoKeys),
			...this.user.info,
		};
	}

	/**
	 * Entity parent id
	 */
	get pid() {
		return this.user.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { email?: string; password?: string }) {
		const { email = `5${(7).numeric}@student.tdtu.edu.vn` } = options || {},
			user = User.test(from, { email });
		return new Student({
			major: (3).string,
			graduationYear: (20).random,
			enrollmentYear: (20).random,
			skills: (3).string,
			user,
		});
	}
}
