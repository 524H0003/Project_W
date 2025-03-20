import { MailerService } from '@nestjs-modules/mailer';
import { LightMyRequestChain } from 'fastify';
import { AppService } from './app.service';

/**
 * Get admin server signature
 * @param {() => LightMyRequestChain} req - server requester
 * @param {AppService} svc - app service
 * @param {MailerService} mailerSvc - mailer service
 */
export async function getAdminSignature(
	req: () => LightMyRequestChain,
	svc: AppService,
	mailerSvc: MailerService,
) {
	const { headers } = await req()
			.post('/request-signature')
			.body({ email: svc.config.get('ADMIN_EMAIL') }),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

	return { headers, signature };
}
