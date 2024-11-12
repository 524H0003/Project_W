import { MailerService } from '@nestjs-modules/mailer';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';

let appSvc: AppService, mailerSvc: MailerService;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	(appSvc = module.get(AppService)), (mailerSvc = module.get(MailerService));
});

beforeEach(() => {});

describe('send', () => {
	it('success', async () => {
		const email = appSvc.config.get('ADMIN_EMAIL'),
			subject = (21).string,
			signature = (22).string;

		await execute(
			() =>
				appSvc.mail.send(email, subject, 'sendSignatureAdmin', { signature }),
			{ exps: [{ type: 'toBeNull', params: [] }] },
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
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				appSvc.mail.send(email, subject, 'sendSignatureAdmin', { signature }),
			{
				exps: [{ type: 'toThrow', params: ['Invalid_Email'] }],
				throwError: true,
			},
		);
	});
});
