import { MailerService } from '@nestjs-modules/mailer';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEnterpriseAssign } from 'enterprise/enterprise.model';
import { LightMyRequestChain } from 'fastify';

export async function assignEnterprise(
	req: () => LightMyRequestChain,
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
		.headers({ 'set-cookie': headers['set-cookie'] })
		.send({
			signature,
			...enterprise,
			...enterprise.baseUser,
		} as IEnterpriseAssign);
}
