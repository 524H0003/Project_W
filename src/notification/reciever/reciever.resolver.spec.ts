import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { execute, initJest, sendGQL } from 'app/utils/test.utils';
import {
	AssignReciever,
	AssignRecieverMany,
	AssignRecieverManyMutation,
	AssignRecieverManyMutationVariables,
	AssignRecieverMutation,
	AssignRecieverMutationVariables,
} from 'compiled_graphql';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Notification } from 'notification/notification.entity';
import { assignNoti } from 'notification/notification.resolver.spec.utils';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let req: TestAgent,
	svc: AppService,
	mailerSvc: MailerService,
	employee: Employee,
	notification: Notification,
	headers: object,
	user: User,
	enterprise: Enterprise;

beforeAll(async () => {
	const { requester, appSvc, module } = await initJest();

	(req = requester), (svc = appSvc), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(user = User.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	headers = (await assignEmployee(req, enterprise, employee, mailerSvc))
		.headers;
	await req.post('/signup').send({ ...user, ...user.baseUser });
	user = await svc.user.findOne({ baseUser: { name: user.baseUser.name } });

	notification = await svc.noti.findOne({
		id: (await assignNoti(Notification.test(fileName), headers))
			.assignNotification.id,
	});
});

describe('assignReciever', () => {
	const send = sendGQL<AssignRecieverMutation, AssignRecieverMutationVariables>(
		AssignReciever,
	);

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{
							input: {
								notificationId: notification.id,
								userId: user.baseUser.id,
							},
						},
						headers['set-cookie'],
					)
				).assignReciever,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					await execute(() => svc.recie.id(result.id), {
						exps: [{ type: 'toBeDefined', params: [] }],
					});
				},
			},
		);
	});
});

describe('assignRecieverMany', () => {
	const usersId: string[] = [],
		send = sendGQL<
			AssignRecieverManyMutation,
			AssignRecieverManyMutationVariables
		>(AssignRecieverMany);

	beforeEach(async () => {
		for (let i = 0; i < 5; i++) {
			const tUser = User.test(fileName);
			if (tUser.hashedPassword) true;
			usersId.push((await svc.user.assign(tUser)).baseUser.id);
		}
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{
							input: {
								notificationId: notification.id,
								usersId,
							},
						},
						headers['set-cookie'],
					)
				).assignRecieverMany,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					for (const { id } of result) {
						await execute(
							() =>
								svc.user.findOne({
									recievedNotifications: [{ id }],
								}),
							{ exps: [{ type: 'toBeDefined', params: [] }] },
						);
						await execute(
							() =>
								svc.noti.findOne({
									sent: [{ id }],
								}),
							{ exps: [{ type: 'toBeDefined', params: [] }] },
						);
					}
				},
			},
		);
	});
});
