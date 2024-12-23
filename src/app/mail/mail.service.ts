import { MailerService } from '@nestjs-modules/mailer';
import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { BaseUser } from 'app/app.entity';
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
		@Inject(forwardRef(() => MailerService))
		private mailerService: MailerService,
		@Inject(forwardRef(() => AppService))
		private appSvc: AppService,
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
		const baseUser = await this.appSvc.baseUser.email(email);

		if (!baseUser && email !== this.appSvc.config.get('ADMIN_EMAIL'))
			throw new BadRequestException('Invalid_Email');

		await this.mailerService.sendMail({
			to: baseUser?.email || email,
			subject,
			template: `./${template}.html`,
			context,
		});

		return baseUser;
	}
}
