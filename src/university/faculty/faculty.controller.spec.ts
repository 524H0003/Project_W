import {
	execute,
	getCookie,
	initJest,
	RequesterType,
} from 'app/utils/test.utils';
import { Faculty } from './faculty.entity';
import { expect } from '@jest/globals';
import { AppService } from 'app/app.service';
import { MailerService } from '@nestjs-modules/mailer';
import { getAdminSignature } from 'app/app.controller.spec.utils';

const fileName = curFile(__filename);

let req: RequesterType,
	faculty: Faculty,
	svc: AppService,
	mailerSvc: MailerService;

beforeAll(async () => {
	const { requester, appSvc, module } = await initJest();

	(mailerSvc = module.get(MailerService)), (req = requester), (svc = appSvc);
});

beforeEach(() => {
	faculty = Faculty.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		const { headers, signature } = await getAdminSignature(req, svc, mailerSvc);

		await execute(
			async () =>
				(
					await req()
						.post('/faculty/assign')
						.headers({ cookie: getCookie(headers['set-cookie']) })
						.body({
							...faculty,
							...faculty.eventCreator.user,
							...faculty.eventCreator.user.baseUser,
							signature,
						})
						.end()
				).headers['set-cookie'],
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.stringContaining('access'),
								expect.stringContaining('refresh'),
								expect.stringContaining('session'),
							]),
						],
					},
				],
			},
		);
	});
});
