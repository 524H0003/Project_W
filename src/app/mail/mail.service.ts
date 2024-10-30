import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AppService } from 'app/app.service';

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
		private appSvc: AppService,
	) {}

	/**
	 * Sending email with context
	 * @param {string} email - destination email
	 * @param {string} host - the hostname of email requester
	 * @param {string} signature - hook's signature
	 */
	async sendResetPassword(email: string, host: string, signature: string) {
		const url = `${host}/hook/${signature}`,
			usr = await this.appSvc.baseUser.email(email);

		if (usr)
			await this.mailerService.sendMail({
				to: usr.email,
				subject: 'Change password request from idk',
				template: './forgetPassword',
				context: { name: usr.name, url },
			});
		else throw new BadRequestException('InvalidUserOrEnterprise');

		return usr;
	}
}
