import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cryption } from 'app/utils/auth.utils';
import { AuthService } from 'auth/auth.service';
import { ILogin, ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';

/**
 * Student service
 */
@Injectable()
export class StudentService extends Cryption {
	/**
	 * @ignore
	 */
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
		private authSvc: AuthService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}
	/**
	 * @ignore
	 */
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;

	/**
	 * Login for student
	 * @param {ILogin} input - the login input
	 * @param {string} mtdt - the metadata
	 */
	async login(input: ILogin, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			if (input.email.match(this.studentMailRex)) {
				await this.authSvc.signUp(
					{
						...input,
						fullName: input.email,
						password: (16).string + '!1Aa',
					} as ISignUp,
					mtdt,
					null,
					{ role: UserRole.student },
				);
				throw new Error('ERRNewUser');
			}
			throw new BadRequestException('Invalid student email');
		} else return this.authSvc.login(input, mtdt);
	}
}
