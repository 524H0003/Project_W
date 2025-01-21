import { AppService } from 'app/app.service';
import TestAgent from 'supertest/lib/agent';
import { Employee } from './employee.entity';
import { execute, initJest } from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { assignEnterprise } from 'enterprise/enterprise.controller.spec.utils';
import { MailerService } from '@nestjs-modules/mailer';

const fileName = curFile(__filename);

let req: TestAgent,
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

	await assignEnterprise(req, enterprise, mailerSvc);
});

describe('hook', () => {
	it('success', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req.post('/employee/hook').send({
						enterpriseName: enterprise.baseUser.name,
						...employee,
						...employee.eventCreator.user.baseUser,
					} as IEmployeeHook),
				),
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});
});

describe('signup', () => {
	it('success', async () => {
		const { headers } = await req.post('/employee/hook').send({
				enterpriseName: enterprise.baseUser.name,
				...employee,
				...employee.eventCreator.user.baseUser,
			} as IEmployeeHook),
			signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0'][
				'context'
			]['signature'];

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/employee/signup')
						.set('Cookie', headers['set-cookie'])
						.send({
							signature,
							enterpriseName: enterprise.baseUser.name,
							...employee,
							...employee.eventCreator.user,
							...employee.eventCreator.user.baseUser,
						} as IEmployeeSignup),
				),
			{
				exps: [
					{
						type: 'toContain',
						params: [employee.eventCreator.user.baseUser.email],
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
