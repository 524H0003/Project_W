import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from 'user/user.service';

/**
 * Mail service
 */
@Injectable()
export class MailService {
	/**
	 * @ignore
	 */
	constructor(
		private mailerService: MailerService,
		private usrSvc: UserService,
	) {}

	/**
	 * Sending email with context
	 * @param {string} email - destination email
	 * @param {string} host - the hostname of email requester
	 * @param {string} signature - hook's signature
	 */
	async sendResetPassword(email: string, host: string, signature: string) {
		const url = `${host}/hook/${signature}`,
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
