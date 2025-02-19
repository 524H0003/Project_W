import { Enterprise } from './enterprise.entity';
import {
	getCookie,
	execute,
	initJest,
	RequesterType,
} from 'app/utils/test.utils';
import { IEnterpriseAssign } from './enterprise.model';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { getAdminSignature } from 'app/app.controller.spec.utils';

const fileName = curFile(__filename);

let req: RequesterType,
	enterprise: Enterprise,
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
		const { headers, signature } = await getAdminSignature(req, svc, mailerSvc);

		await execute(
			async () =>
				(
					await req()
						.post('/enterprise/assign')
						.headers({ cookie: getCookie(headers['set-cookie']) })
						.body({
							signature,
							...enterprise,
							...enterprise.baseUser,
						} as IEnterpriseAssign)
						.end()
				).body,
			{ exps: [{ type: 'toContain', params: ['Success_Enterprise_Assign'] }] },
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
