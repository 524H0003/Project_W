import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { execute, initJest, sendGQL } from 'app/utils/test.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';
import { Notification } from './notification.entity';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import {
	AssignNotification,
	AssignNotificationMutation,
	AssignNotificationMutationVariables,
	UpdateNotification,
	UpdateNotificationMutation,
	UpdateNotificationMutationVariables,
} from 'build/compiled_graphql';

const fileName = curFile(__filename);

let req: TestAgent,
	svc: AppService,
	mailerSvc: MailerService,
	employee: Employee,
	notification: Notification,
	headers: object,
	enterprise: Enterprise;

beforeAll(async () => {
	const { module, appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(notification = Notification.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	headers = (await assignEmployee(req, svc, enterprise, employee, mailerSvc))
		.headers;
});

describe('assignNotification', () => {
	const send = sendGQL<
		AssignNotificationMutation,
		AssignNotificationMutationVariables
	>(AssignNotification);

	it('success', async () => {
		await execute(
			async () =>
				(await send({ input: notification }, { cookie: headers['set-cookie'] }))
					.assignNotification,
			{
				exps: [
					{ type: 'toHaveProperty', params: ['content', notification.content] },
				],
			},
		);
		await execute(() => svc.notification.find({ title: notification.title }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
	});
});

describe('updateNotification', () => {
	const send = sendGQL<
		UpdateNotificationMutation,
		UpdateNotificationMutationVariables
	>(UpdateNotification);
	let notificationId: string;

	beforeEach(async () => {
		notificationId = (
			await sendGQL<
				AssignNotificationMutation,
				AssignNotificationMutationVariables
			>(AssignNotification)(
				{ input: notification },
				{ cookie: headers['set-cookie'] },
			)
		).assignNotification.id;
	});

	it('success', async () => {
		const newContent = 'Edited_' + (30).string;

		await execute(
			async () =>
				(
					await send(
						{ input: { id: notificationId, content: newContent } },
						{ cookie: headers['set-cookie'] },
					)
				).updateNotification,
			{ exps: [{ type: 'toHaveProperty', params: ['content', newContent] }] },
		);
		await execute(() => svc.notification.find({ content: newContent }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
		await execute(
			() => svc.notification.find({ content: notification.content }),
			{
				exps: [{ type: 'toHaveLength', params: [0] }],
			},
		);
	});

	it('failed due to invalid id', async () => {
		const newId =
			notificationId.at(-1) !== '0'
				? notificationId.slice(0, -1) + '0'
				: notificationId.slice(0, -1) + '1';

		await execute(
			async () =>
				JSON.stringify(
					await send(
						{ input: { id: newId } },
						{ cookie: headers['set-cookie'] },
					),
				),
			{
				exps: [
					{ type: 'toThrow', params: [err('Invalid', 'Notification', '')] },
				],
			},
		);
	});
});
