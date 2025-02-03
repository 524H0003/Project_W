import { MailerService } from '@nestjs-modules/mailer';
import { cookie } from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEnterpriseAssign } from 'enterprise/enterprise.model';
import { LightMyRequestChain } from 'fastify';
import TestAgent from 'supertest/lib/agent';

export async function assignEnterprise(
	req: {
		(testCore: 'fastify'): LightMyRequestChain;
		(testCore: 'supertest'): TestAgent;
		(): LightMyRequestChain;
	},
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
		.headers({ cookie: cookie(headers['set-cookie']) })
		.body({
			signature,
			...enterprise,
			...enterprise.baseUser,
		} as IEnterpriseAssign);
}
