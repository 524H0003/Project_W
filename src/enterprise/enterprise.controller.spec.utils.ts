import { MailerService } from '@nestjs-modules/mailer';
import { getCookie, RequesterType } from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEnterpriseAssign } from 'enterprise/enterprise.model';

export async function assignEnterprise(
	req: RequesterType,
	enterprise: Enterprise,
	mailerSvc: MailerService,
	adminEmail: string,
) {
	const { headers } = await req()
			.post('/request-signature')
			.body({ email: adminEmail }),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

	await req()
		.post('/enterprise/assign')
		.headers({ cookie: getCookie(headers['set-cookie']) })
		.body({
			signature,
			...enterprise,
			...enterprise.baseUser,
		} as IEnterpriseAssign);
}
