import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import {
	AssignReciever,
	AssignRecieverMany,
	AssignRecieverManyMutation,
	AssignRecieverManyMutationVariables,
	AssignRecieverMutation,
	AssignRecieverMutationVariables,
	GetNotifications,
	GetNotificationsQuery,
	GetNotificationsQueryVariables,
	ReadNotification,
	ReadNotificationMany,
	ReadNotificationManyMutation,
	ReadNotificationManyMutationVariables,
	ReadNotificationMutation,
	ReadNotificationMutationVariables,
} from 'build/compiled_graphql';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Notification } from 'notification/notification.entity';
import { assignNoti } from 'notification/notification.resolver.spec.utils';
import { User } from 'user/user.entity';
import { Reciever } from './reciever.entity';
import { Student } from 'university/student/student.entity';
import { assignStudent } from 'university/student/student.controller.spec.utils';
import { OutgoingHttpHeaders } from 'http';

const fileName = curFile(__filename);

let req: RequesterType,
	svc: AppService,
	mailerSvc: MailerService,
	employee: Employee,
	notification: Notification,
	headers: OutgoingHttpHeaders,
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
	await req()
		.post('/sign-up')
		.body({ ...user, ...user.baseUser });
	user = await svc.user.findOne({
		baseUser: { name: user.baseUser.name },
		cache: false,
	});

	notification = await svc.notification.findOne({
		id: (await assignNoti(Notification.test(fileName), headers))
			.assignNotification.id,
		cache: false,
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
						{ input: { notificationId: notification.id, userId: user.id } },
						{ headers: headers },
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
			usersId.push((await svc.user.assign({ ...tUser, ...tUser.baseUser })).id);
		}
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { notificationId: notification.id, usersId } },
						{ headers: headers },
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
									cache: false,
								}),
							{ exps: [{ type: 'toBeDefined', params: [] }] },
						);
						await execute(
							() => svc.notification.findOne({ sent: [{ id }], cache: false }),
							{ exps: [{ type: 'toBeDefined', params: [] }] },
						);
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

	let reciever: Reciever, userHeaders: OutgoingHttpHeaders;

	beforeEach(async () => {
		const tUser = Student.test(fileName),
			{ headers, student } = await assignStudent(req, svc, tUser, mailerSvc);

		(userHeaders = headers),
			(reciever = await svc.recie.assign(notification.id, student.id));
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { recieverId: reciever.id } },
						{ headers: userHeaders },
					)
				).readNotification,
			{
				exps: [{ type: 'toThrow', not: true, params: [] }],
				onFinish: async () => {
					await execute(async () => (await svc.recie.id(reciever.id)).isRead, {
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

	let userHeaders: OutgoingHttpHeaders;

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
				(await send({ input: { recieversId } }, { headers: userHeaders }))
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

describe('getNotifications', () => {
	const send = sendGQL<
			GetNotificationsQuery,
			GetNotificationsQueryVariables
		>(GetNotifications),
		recieversId: string[] = [];

	let userHeaders: OutgoingHttpHeaders, numRead: number;

	beforeEach(async () => {
		const tUser = Student.test(fileName),
			{ headers, student } = await assignStudent(req, svc, tUser, mailerSvc);

		(userHeaders = headers), (numRead = 0);

		for (let i = 0; i < 5; i++) {
			recieversId.push(
				(await svc.recie.assign(notification.id, student.user.id)).id,
			);
			if ((6).random % 2) {
				numRead++;
				await svc.recie.read(recieversId.lastElement);
			}
		}
	});

	it('success', async () => {
		await execute(
			async () =>
				(await send({}, { headers: userHeaders })).getNotifications.items.length,
			{ exps: [{ type: 'toEqual', params: [5] }] },
		);
	});

	it('success with isRead filterring', async () => {
		await execute(
			async () =>
				(await send({ isRead: false }, { headers: userHeaders }))
					.getNotifications.items,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					await execute(() => result.length, {
						exps: [{ type: 'toEqual', params: [5 - numRead] }],
					});

					await Promise.all(
						result.map(async ({ id }) => (await svc.recie.id(id)).isRead, {
							exps: [{ type: 'toEqual', params: [false] }],
						}),
					);
				},
			},
		);
	});
});
