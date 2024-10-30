import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'auth/auth.service';
import { ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { Student } from './student.entity';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { IStudentSignup } from './student.model';
import { InterfaceCasting } from 'app/utils/utils';
import { ISignUpKeys, IStudentInfoKeys } from 'models';

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
	 */
	async login(input: IStudentSignup) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			if (input.email.match(this.studentMailRex)) {
				await this.authSvc.signUp(
					{
						...InterfaceCasting.quick(input, ISignUpKeys),
						fullName: input.email,
						password: (32).string + '!1Aa',
					} as ISignUp,
					null,
					{ role: UserRole.student },
				);
				try {
					await this.save({
						user: await this.usrSvc.email(input.email),
						...InterfaceCasting.quick(input, IStudentInfoKeys),
					});
				} catch (error) {
					await this.usrSvc.remove({ user: { email: input.email } });
					throw new BadRequestException(
						`Null value in field ${error['column']}`,
					);
				}
				throw new Error('ERRNewUser');
			}
			throw new BadRequestException('InvalidStudentEmail');
		} else return this.authSvc.login(input);
	}
}
