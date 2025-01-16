import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IUserSignUp, UserRole } from 'user/user.model';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { IStudentSignup } from './student.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IStudentInfoKeys, IUserSignUpKeys } from 'build/models';
import { validation } from 'app/utils/auth.utils';
import { AppService } from 'app/app.service';

/**
 * Student service
 */
@Injectable()
export class StudentService extends DatabaseRequests<Student> {
	constructor(
		@InjectRepository(Student) repo: Repository<Student>,
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
	) {
		super(repo);
	}
	/**
	 * @ignore
	 */
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;

	/**
	 * Sign up for student
	 * @param {IStudentSignup} input - the sign up form
	 * @return {Promise<void>}
	 */
	async signUp(input: IStudentSignup): Promise<void> {
		const user = await this.svc.baseUser.email(input.email),
			rawStu = new Student(input);

		if (user) throw new ServerException('Invalid', 'User', 'SignUp', 'user');
		if (!rawStu.user.baseUser.email.match(this.studentMailRex))
			throw new ServerException('Invalid', 'Email', '', 'user');

		return await validation<void>(rawStu, async () => {
			const user = await this.svc.auth.signUp(
				{
					...InterfaceCasting.quick(input, IUserSignUpKeys),
					name: input.email,
					password: (32).string + '!1Aa',
				} as IUserSignUp,
				null,
				{ role: UserRole.student },
			);

			if (user.hashedPassword) {
				await this.save({
					user,
					...InterfaceCasting.quick(input, IStudentInfoKeys),
					enrollmentYear: Number('20' + input.email.toString().slice(1, 3)),
				});
				throw new ServerException('Success', 'User', 'SignUp', 'user');
			}
		});
	}
}
