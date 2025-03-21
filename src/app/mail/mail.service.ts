import { MailerService } from '@nestjs-modules/mailer';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { BaseUser } from 'user/base/baseUser.entity';

/**
 * Mail service
 */
@Injectable()
export class MailService {
	/**
	 * Initiate mail service
	 */
	constructor(
		@Inject(forwardRef(() => MailerService))
		private mailerService: MailerService,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {}

	/**
	 * Sending email with context
	 * @param {string} email - destination email
	 * @param {string} subject - email subject
	 * @param {string} template - the template name
	 * @param {object} context - hook's signature
	 * @return {Promise<BaseUser>}
	 */
	async send(
		email: string,
		subject: string,
		template: string,
		context: object,
	): Promise<BaseUser> {
		const baseUser = await this.svc.baseUser.email(email);

		if (baseUser.isNull() && email !== this.svc.config.get('ADMIN_EMAIL'))
			throw new ServerException('Invalid', 'Email', '');

		await this.mailerService.sendMail({
			to: baseUser?.email || this.svc.config.get('ADMIN_EMAIL'),
			subject,
			template: `./${template}.html`,
			context,
		});

		return baseUser;
	}
}
