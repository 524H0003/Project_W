import { MailerService } from '@nestjs-modules/mailer';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEnterpriseAssign } from 'enterprise/enterprise.model';
import TestAgent from 'supertest/lib/agent';

export async function assignEnterprise(
	req: () => TestAgent,
	enterprise: Enterprise,
	mailerSvc: MailerService,
	adminEmail: string,
) {
	const { headers } = await req()
			.post('/request-signature')
			.send({ email: adminEmail }),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

	await req()
		.post('/enterprise/assign')
		.set('Cookie', headers['set-cookie'])
		.send({
			signature,
			...enterprise,
			...enterprise.baseUser,
		} as IEnterpriseAssign);
}
