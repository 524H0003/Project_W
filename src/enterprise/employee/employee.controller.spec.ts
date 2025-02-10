import { AppService } from 'app/app.service';
import { Employee } from './employee.entity';
import {
	getCookie,
	execute,
	initJest,
	RequesterType,
} from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEmployeeHook, IEmployeeSignUp } from './employee.model';
import { assignEnterprise } from 'enterprise/enterprise.controller.spec.utils';
import { MailerService } from '@nestjs-modules/mailer';

const fileName = curFile(__filename);

let req: RequesterType,
	svc: AppService,
	mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee;

beforeAll(async () => {
	const { appSvc, requester, module } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	await assignEnterprise(
		req,
		enterprise,
		mailerSvc,
		svc.cfg.get('ADMIN_EMAIL'),
	);
});

describe('hook', () => {
	it('success', async () => {
		await execute(
			async () =>
				(
					await req()
						.post('/employee/hook')
						.body({
							enterpriseName: enterprise.baseUser.name,
							...employee,
							...employee.eventCreator.user.baseUser,
						} as IEmployeeHook)
						.end()
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});
});

describe('signUp', () => {
	it('success', async () => {
		const { headers } = await req()
				.post('/employee/hook')
				.body({
					enterpriseName: enterprise.baseUser.name,
					...employee,
					...employee.eventCreator.user.baseUser,
				} as IEmployeeHook),
			signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0'][
				'context'
			]['signature'];

		await execute(
			async () =>
				(
					await req()
						.post('/employee/sign-up')
						.headers({ cookie: getCookie(headers['set-cookie']) })
						.body({
							signature,
							enterpriseName: enterprise.baseUser.name,
							...employee,
							...employee.eventCreator.user,
							...employee.eventCreator.user.baseUser,
						} as IEmployeeSignUp)
						.end()
				).body,
			{
				exps: [
					{
						type: 'toContain',
						params: [employee.eventCreator.user.baseUser.email.lower],
					},
				],
			},
		);
		await execute(
			() =>
				svc.employee.findOne({
					eventCreator: {
						user: {
							baseUser: { name: employee.eventCreator.user.baseUser.name },
						},
					},
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
		await execute(
			() =>
				svc.enterprise.findOne({
					employees: [
						{
							eventCreator: {
								user: {
									baseUser: { name: employee.eventCreator.user.baseUser.name },
								},
							},
						},
					],
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});
});
