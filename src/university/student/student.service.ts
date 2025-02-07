import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole } from 'user/user.model';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { IStudentSignUp } from './student.model';
import { AppService } from 'app/app.service';

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
		super(repo);
	}
	/**
	 * @ignore
	 */
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;

	/**
	 * Sign up for student
	 * @param {IStudentSignUp} input - the sign up form
	 * @return {Promise<void>}
	 */
	async signUp({
		email,
	}: Required<Pick<IStudentSignUp, 'email'>>): Promise<void> {
		const existedUser = await this.svc.baseUser.email(email);

		if (existedUser) throw new ServerException('Invalid', 'User', 'SignUp');
		if (!email.match(this.studentMailRex))
			throw new ServerException('Invalid', 'Email', '');

		const student = await this.svc.auth.signUp(
			{ email, name: email, password: (32).string + '!1Aa' },
			null,
			{ role: UserRole.student },
		);

		await student.hashingPassword();
		await this.save({
			user: student,
			enrollmentYear: Number('20' + email.toString().slice(1, 3)),
		});

		throw new ServerException('Success', 'User', 'SignUp');
	}
}
