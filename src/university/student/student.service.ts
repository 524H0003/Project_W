import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cryption } from 'app/utils/auth.utils';
import { AuthService } from 'auth/auth.service';
import { ILogin, ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';

@Injectable()
export class StudentService extends Cryption {
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
		private authSvc: AuthService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}
	private studentMailRex = /(5{1})(.{7})(@student.tdtu.edu.vn){1}/g;
	static defaultPassword = '123!Aoooooooooooo';

	async login(input: ILogin, mtdt: string) {
		const user = await this.usrSvc.email(input.email);
		if (!user) {
			if (
				input.email.match(this.studentMailRex) &&
				input.password === StudentService.defaultPassword
			) {
				return this.authSvc.signUp(
					{ ...input, fullName: input.email } as ISignUp,
					mtdt,
					null,
					{ role: UserRole.student },
				);
			}
			throw new BadRequestException('Invalid student email');
		} else return this.authSvc.login(input, mtdt);
	}
}
