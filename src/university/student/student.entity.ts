import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IStudentInfo, IStudentEntity } from './student.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IStudentInfoKeys } from 'build/models';
import { IUserInfo } from 'user/user.model';
import {
	type NonFunctionProperties,
	ParentId,
} from 'app/typeorm/typeorm.utils';
import { Field, ObjectType } from '@nestjs/graphql';
import { IBaseUserInfo } from 'user/base/baseUser.model';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Student entity
 */
@ObjectType()
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'Student' })
export class Student extends ParentId implements IStudentEntity {
	/**
	 * Create student entity with infomations
	 * @param {NonFunctionProperties<IStudentEntity>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IStudentEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IStudentInfoKeys));
		this.user = new User(payload.user);
		setEntity(
			Enterprise,
			[payload.currentEnterprise],
			this,
			'currentEnterprise',
		);
	}

	// Core Entity
	/**
	 * Student user infomations
	 */
	@OneToOne(() => User, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
	@Field()
	user: User;

	// Relationships
	/**
	 * Student current working enterprise
	 */
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.students)
	@JoinColumn({ name: 'current_enterprise_id' })
	@Field(() => Enterprise, { nullable: true })
	currentEnterprise: Enterprise;

	// Infomations
	/**
	 * Student's major
	 */
	@Column({ name: 'major', default: '' }) @Field() major: string;

	/**
	 * Student's skills
	 */
	@Column({ name: 'skills', type: 'text', default: '' })
	@Field()
	skills: string;

	/**
	 * Student graduation year
	 */
	@Column({ name: 'graduation_year', nullable: true })
	@Field({ nullable: true })
	graduationYear: number;

	/**
	 * Student enrollment year
	 */
	@Column({ name: 'enrollment_year' }) @Field() enrollmentYear: number;

	// Methods
	/**
	 * A function return user's public infomations
	 */
	get info(): { student: IStudentInfo; user: IUserInfo & IBaseUserInfo } {
		return {
			student: InterfaceCasting.quick(this, IStudentInfoKeys),
			user: this.user.info,
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
