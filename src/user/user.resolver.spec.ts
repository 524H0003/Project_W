import { beforeAll, beforeEach, expect } from '@jest/globals';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import {
	GetUsers,
	GetUsersQuery,
	GetUsersQueryVariables,
} from 'build/compiled_graphql';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { OutgoingHttpHeaders } from 'http';

const fileName = curFile(__filename);

let req: RequesterType,
	svc: AppService,
	mailerSvc: MailerService,
	headers: OutgoingHttpHeaders,
	employee: Employee;

beforeAll(async () => {
	const { requester, appSvc, module } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	const res = await assignEmployee(
		req,
		svc,
		Enterprise.test(fileName),
		Employee.test(fileName),
		mailerSvc,
	);

	(headers = res.headers), (employee = res.employee);
});

describe('getUsers', () => {
	const send = sendGQL<GetUsersQuery, GetUsersQueryVariables>(GetUsers);

	it('success', async () => {
		await execute(
			async () => (await send({ input: {} }, { headers })).getUsers,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								}),
							]),
						],
					},
				],
			},
		);
	});

	it('success with id', async () => {
		await execute(
			async () =>
				(await send({ input: { id: employee.id } }, { headers })).getUsers,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							[
								{
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								},
							],
						],
					},
				],
			},
		);
	});

	it('success with name', async () => {
		await execute(
			async () =>
				(await send({ input: { name: employee.info.user.name } }, { headers }))
					.getUsers,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							[
								{
									...employee.eventCreator.user.info,
									lastLogin: expect.anything(),
								},
							],
						],
					},
				],
			},
		);
	});
});
