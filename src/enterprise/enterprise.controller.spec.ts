import TestAgent from 'supertest/lib/agent';
import { Enterprise } from './enterprise.entity';
import { execute, initJest } from 'app/utils/test.utils';
import { IEnterpriseAssign } from './enterprise.model';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { EnterpriseController } from './enterprise.controller';

const fileName = curFile(__filename);

let req: TestAgent,
	enterprise: Enterprise,
	signature: string,
	svc: AppService,
	mailerSvc: MailerService;

beforeAll(async () => {
	const { appSvc, module, requester } = await initJest([EnterpriseController]);

	(mailerSvc = module.get(MailerService)), (svc = appSvc), (req = requester);
});

beforeEach(() => {
	enterprise = Enterprise.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		const { headers } = await req.post('/request-signature').send();

		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/enterprise/assign')
						.set('Cookie', headers['set-cookie'])
						.send({
							signature,
							...enterprise,
							...enterprise.baseUser,
						} as IEnterpriseAssign),
				),
			{
				exps: [{ type: 'toContain', params: ['Success_Assign_Enterprise'] }],
			},
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
