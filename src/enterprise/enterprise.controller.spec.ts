import { LightMyRequestChain } from 'fastify';
import { Enterprise } from './enterprise.entity';
import { execute, initJest } from 'app/utils/test.utils';
import { IEnterpriseAssign } from './enterprise.model';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';

const fileName = curFile(__filename);

let req: () => LightMyRequestChain,
	enterprise: Enterprise,
	signature: string,
	svc: AppService,
	mailerSvc: MailerService;

beforeAll(async () => {
	const { appSvc, module, requester } = await initJest();

	(mailerSvc = module.get(MailerService)), (svc = appSvc), (req = requester);
});

beforeEach(() => {
	enterprise = Enterprise.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		const { headers } = await req()
			.post('/request-signature')
			.body({ email: svc.cfg.get('ADMIN_EMAIL') });

		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

		await execute(
			async () =>
				JSON.stringify(
					await req()
						.post('/enterprise/assign')
						.headers({ 'set-cookie': headers['set-cookie'] })
						.body({
							signature,
							...enterprise,
							...enterprise.baseUser,
						} as IEnterpriseAssign),
				),
			{ exps: [{ type: 'toContain', params: ['Success_Assign_Enterprise'] }] },
		);
		await execute(
			() =>
				svc.enterprise.findOne({
					baseUser: { name: enterprise.baseUser.name },
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});
});
