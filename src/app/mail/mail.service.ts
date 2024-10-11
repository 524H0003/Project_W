import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'user/user.service';

@Injectable()
export class MailService {
	constructor(
		private mailerService: MailerService,
		private usrSvc: UserService,
	) {}

	async sendResetPassword(email: string, host: string, token: string) {
		const url = `${host}/hook/${token}`,
			usr = await this.usrSvc.email(email);

		if (usr)
			await this.mailerService.sendMail({
				to: usr.email,
				subject: 'Change password request from idk',
				template: './forgetPassword',
				context: { name: usr.fullName, url },
			});
		else throw new BadRequestException('User not existed');

		return usr;
	}
}
