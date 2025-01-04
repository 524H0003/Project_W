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
	ReadNotification,
	ReadNotificationMany,
	ReadNotificationManyMutation,
	ReadNotificationManyMutationVariables,
	ReadNotificationMutation,
	ReadNotificationMutationVariables,
} from 'compiled_graphql';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Notification } from 'notification/notification.entity';
import { assignNoti } from 'notification/notification.resolver.spec.utils';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { Reciever } from './reciever.entity';
import { Student } from 'university/student/student.entity';
import { assignStudent } from 'university/student/student.controller.spec.utils';

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

	headers = (await assignEmployee(req, svc, enterprise, employee, mailerSvc))
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
								userId: user.id,
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
			usersId.push((await svc.user.assign(tUser)).id);
		}
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { notificationId: notification.id, usersId } },
						headers['set-cookie'],
					)
				).assignRecieverMany,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					for (const { id } of result) {
						await execute(
							() => svc.user.findOne({ recievedNotifications: [{ id }] }),
							{ exps: [{ type: 'toBeDefined', params: [] }] },
						);
						await execute(() => svc.noti.findOne({ sent: [{ id }] }), {
							exps: [{ type: 'toBeDefined', params: [] }],
						});
					}
				},
			},
		);
	});
});

describe('readNotification', () => {
	const send = sendGQL<
		ReadNotificationMutation,
		ReadNotificationMutationVariables
	>(ReadNotification);

	let reciever: Reciever, userHeaders: object;

	beforeEach(async () => {
		const tUser = Student.test(fileName);
		userHeaders = (await assignStudent(req, svc, tUser, mailerSvc)).headers;
		reciever = await svc.recie.assign(notification.id, tUser.user.id);
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { recieverId: reciever.id } },
						userHeaders['set-cookie'],
					)
				).readNotification,
			{
				exps: [{ type: 'toHaveProperty', params: ['isRead', true] }],
				onFinish: async (result) => {
					await execute(async () => (await svc.recie.id(result.id)).isRead, {
						exps: [{ type: 'toEqual', params: [true] }],
					});
				},
			},
		);
	});
});

describe('readNotificationMany', () => {
	const send = sendGQL<
			ReadNotificationManyMutation,
			ReadNotificationManyMutationVariables
		>(ReadNotificationMany),
		recieversId: string[] = [];

	let userHeaders: object;

	beforeEach(async () => {
		const tUser = Student.test(fileName),
			{ headers, student } = await assignStudent(req, svc, tUser, mailerSvc);

		userHeaders = headers;

		for (let i = 0; i < 5; i++) {
			recieversId.push(
				(await svc.recie.assign(notification.id, student.user.id)).id,
			);
		}
	});

	it('success', async () => {
		await execute(
			async () =>
				(await send({ input: { recieversId } }, userHeaders['set-cookie']))
					.readNotificationMany,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					await Promise.all(
						result.map(
							async ({ id }) =>
								await execute(async () => (await svc.recie.id(id)).isRead, {
									exps: [{ type: 'toEqual', params: [true] }],
								}),
						),
					);
				},
			},
		);
	});
});
