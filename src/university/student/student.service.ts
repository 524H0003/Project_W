import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'user/user.model';
import { Student } from './student.entity';
import { DeepPartial, Repository } from 'typeorm';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { AppService } from 'app/app.service';
import { ISutdentRelationshipKeys } from 'build/models';
import { IStudentSignUp } from './student.model';

/**
 * Student service
 */
@Injectable()
export class StudentService extends DatabaseRequests<Student> {
	/**
	 * Initiate student service
	 */
	constructor(
		@InjectRepository(Student) repo: Repository<Student>,
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
	) {
		super(repo, Student);
	}
	/**
	 * @ignore
	 */
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;

	// Abstract
	/**
	 * Sign up for student
	 * @param {IStudentSignUp} input - the sign up form
	 */
	async assign({
		email,
	}: Required<Pick<IStudentSignUp, 'email'>>): Promise<Student> {
		const existedUser = await this.svc.baseUser.email(email);

		if (!existedUser.isNull())
			throw new ServerException('Invalid', 'User', 'SignUp');
		if (!email.match(this.studentMailRex))
			throw new ServerException('Invalid', 'Email', '');

		const student = await this.svc.auth.signUp(
			{ email, name: email, password: (32).string + '!1Aa' },
			null,
			{ role: UserRole.student },
		);

		return this.save({
			user: student,
			enrollmentYear: Number('20' + email.toString().slice(1, 3)),
		});
	}

	public modify(
		id: string,
		update: DeepPartial<Student>,
		raw?: boolean,
	): Promise<void> {
		update = InterfaceCasting.delete(update, ISutdentRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
