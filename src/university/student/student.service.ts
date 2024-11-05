import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'auth/auth.service';
import { IUserSignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { IStudentSignup } from './student.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IStudentInfoKeys, IUserSignUpKeys } from 'models';
import { validation } from 'app/utils/auth.utils';
import { User } from 'user/user.entity';

/**
 * Student service
 */
@Injectable()
export class StudentService extends DatabaseRequests<Student> {
	/**
	 * @ignore
	 */
	constructor(
		private usrSvc: UserService,
		private authSvc: AuthService,
		@InjectRepository(Student) repo: Repository<Student>,
	) {
		super(repo);
	}
	/**
	 * @ignore
	 */
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;

	/**
	 * Login for student
	 * @param {IStudentSignup} input - the login input
	 * @return {Promise<User>}
	 */
	async login(input: IStudentSignup): Promise<User> {
		const user = await this.usrSvc.email(input.email),
			rawStu = new Student(input);

		if (user) return this.authSvc.login(input);

		if (!rawStu.user.base.email.match(this.studentMailRex))
			throw new BadRequestException('Invalid_Student_Email');

		return await validation<User>(rawStu, async () => {
			const user = await this.authSvc.signUp(
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
				throw new Error('Request_New_User');
			}
			return user;
		});
	}
}
