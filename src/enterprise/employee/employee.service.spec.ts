import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Employee } from './employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { UAParser } from 'ua-parser-js';
import { Hook } from 'app/hook/hook.entity';
import { randomUUID } from 'node:crypto';
import { beforeEach } from '@jest/globals';

const fileName = curFile(__filename);

let svc: AppService, employee: Employee, enterprise: Enterprise;

beforeAll(async () => {
	const { appSvc } = await initJest();

	(svc = appSvc), (enterprise = Enterprise.test(fileName));

	enterprise = await svc.enterprise.assign(
		{ ...enterprise, ...enterprise.baseUser },
		null,
	);
});

beforeEach(() => {
	employee = Employee.test(fileName);
});

describe('hook', () => {
	it('success', async () => {
		await execute(
			async () =>
				svc.employee.hook(
					{
						enterpriseName: enterprise.baseUser.name,
						...employee.eventCreator.user.baseUser,
						...employee,
					},
					new UAParser().getResult(),
				),
			{ exps: [{ type: 'toBeInstanceOf', params: [Hook] }] },
		);
	});

	it('failed due to non existed enterprise', async () => {
		await execute(
			async () =>
				svc.employee.hook(
					{
						enterpriseName: (20).string,
						...employee.eventCreator.user.baseUser,
						...employee,
					},
					new UAParser().getResult(),
				),
			{
				exps: [{ type: 'toThrow', params: [err('Invalid', 'Enterprise', '')] }],
			},
		);
	});
});

describe('assign', () => {
	it('success', async () => {
		await execute(
			() =>
				svc.employee.assign(
					{
						...employee.eventCreator.user,
						...employee.eventCreator.user.baseUser,
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
						...employee.eventCreator.user,
						...employee.eventCreator.user.baseUser,
						...employee,
						id: randomUUID(),
					},
					null,
				),
			{
				exps: [{ type: 'toThrow', params: [err('Invalid', 'Enterprise', '')] }],
			},
		);
	});
});

describe('modify', () => {
	it('success', async () => {
		const dbUser = await svc.employee.assign(
				{
					...employee.eventCreator.user,
					...employee.eventCreator.user.baseUser,
					...employee,
					id: enterprise.id,
				},
				null,
			),
			newName = (20).string;

		await execute(
			() =>
				svc.employee.modify(dbUser.id, {
					eventCreator: { user: { baseUser: { name: newName } } },
				}),
			{
				exps: [{ type: 'toThrow', not: true, params: [] }],
				onFinish: async () => {
					await execute(
						() =>
							svc.employee.find({
								eventCreator: { user: { baseUser: { name: newName } } },
								cache: false,
							}),
						{ exps: [{ type: 'toHaveLength', params: [1] }] },
					);
					await execute(
						() => svc.baseUser.find({ name: newName, cache: false }),
						{ exps: [{ type: 'toHaveLength', params: [1] }] },
					);
				},
			},
		);
	});
});
