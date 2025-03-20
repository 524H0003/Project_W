import { expect } from '@jest/globals';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';

let svc: AppService, mailerSvc: MailerService;

beforeAll(async () => {
	const { appSvc, module } = await initJest();

	(svc = appSvc), (mailerSvc = module.get(MailerService));
});

beforeEach(() => {});

describe('send', () => {
	it('success', async () => {
		const email = svc.config.get('ADMIN_EMAIL'),
			subject = (21).string,
			signature = (22).string;

		await execute(
			() => svc.mail.send(email, subject, 'sendSignatureAdmin', { signature }),
			{ exps: [{ type: 'toEqual', params: [{}] }] },
		);
		expect(mailerSvc.sendMail).toHaveBeenCalledWith({
			to: email,
			subject,
			template: './sendSignatureAdmin.html',
			context: { signature },
		});
	});

	it('failed due to invalid email', async () => {
		const email = (20).string + '@gmail.com',
			subject = (21).string,
			signature = (22).string;

		await execute(
			() => svc.mail.send(email, subject, 'sendSignatureAdmin', { signature }),
			{ exps: [{ type: 'toThrow', params: ['Invalid_Email'] }] },
		);
	});
});
