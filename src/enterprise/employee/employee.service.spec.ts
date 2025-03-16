import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Employee } from './employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { UAParser } from 'ua-parser-js';
import { Hook } from 'app/hook/hook.entity';
import { randomUUID } from 'node:crypto';

const fileName = curFile(__filename);

let svc: AppService, employee: Employee, enterprise: Enterprise;

beforeAll(async () => {
	const { appSvc } = await initJest();

	(svc = appSvc),
		(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	enterprise = await svc.enterprise.assign(
		{ ...enterprise, ...enterprise.baseUser },
		null,
	);
});

beforeEach(() => {});

describe('EmployeeService', () => {
	describe('hook', () => {
		it('success', async () => {
			await execute(
				async () =>
					svc.employee.hook(
						{
							...employee.eventCreator.user.baseUser,
							...employee.eventCreator.user,
							...employee,
							enterpriseName: enterprise.baseUser.name,
						},
						new UAParser().getResult(),
					),
				{ exps: [{ type: 'toBeInstanceOf', params: [Hook] }] },
			);
		});
	});

	describe('assign', () => {
		it('success', async () => {
			await execute(
				() =>
					svc.employee.assign(
						{
							...employee.eventCreator.user.baseUser,
							...employee.eventCreator.user,
							...employee,
							id: enterprise.id,
						},
						null,
					),
				{ exps: [{ type: 'toBeDefined', params: [] }] },
			);
		});

		it('failed due to non existed enterprise', async () => {
			await execute(
				() =>
					svc.employee.assign(
						{
							...employee.eventCreator.user.baseUser,
							...employee.eventCreator.user,
							...employee,
							id: randomUUID(),
						},
						null,
					),
				{
					exps: [
						{ type: 'toThrow', params: [err('Invalid', 'Enterprise', '')] },
					],
				},
			);
		});
	});
});
