import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Notification } from 'notification/notification.entity';
import { User } from 'user/user.entity';
import { Reciever } from './reciever.entity';

const fileName = curFile(__filename);

let svc: AppService, notification: Notification, user: User;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeAll(async () => {
	const rawUser = User.test(fileName);

	(notification = await svc.notification.assign(Notification.test(fileName))),
		(user = await svc.user.assign({ ...rawUser }));
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => svc.recie.assign(notification.id, user.id), {
			exps: [{ type: 'toBeInstanceOf', params: [Reciever] }],
			onFinish: async (result) => {
				await execute(
					() =>
						svc.user.findOne({
							recievedNotifications: [{ id: result.id }],
							baseUser: { id: user.id },
							cache: false,
						}),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
				await execute(
					() =>
						svc.notification.findOne({
							sent: [{ id: result.id }],
							id: notification.id,
							cache: false,
						}),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
			},
		});
	});
});

describe('assignMany', () => {
	const usersId: string[] = [];

	beforeEach(async () => {
		for (let i = 0; i < 5; i++) {
			const tUser = User.test(fileName);
			usersId.push((await svc.user.assign({ ...tUser, ...tUser.baseUser })).id);
		}
	});

	it('success', async () => {
		await execute(() => svc.recie.assignMany(notification.id, usersId), {
			exps: [{ type: 'toBeInstanceOf', params: [Array<Reciever>] }],
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
		});
	});
});

describe('read', () => {
	let reciever: Reciever;

	beforeEach(async () => {
		reciever = await svc.recie.assign(notification.id, user.id);
	});

	it('success', async () => {
		await execute(() => svc.recie.read(reciever.id), {
			exps: [{ type: 'toBeInstanceOf', params: [Reciever] }],
			onFinish: async (result) => {
				await execute(
					() => svc.recie.findOne({ id: result.id, cache: false }),
					{
						exps: [
							{ type: 'toHaveProperty', params: ['isRead', true] },
							{ type: 'toHaveProperty', params: ['readAt', null], not: true },
						],
					},
				);
			},
		});
	});
});

describe('readMany', () => {
	const recieversId: string[] = [];

	beforeEach(async () => {
		for (let i = 0; i < 5; i++)
			recieversId.push(
				(
					await svc.recie.assign(
						(
							await svc.notification.assign(
								Notification.test(fileName + '_' + (5).string),
							)
						).id,
						user.id,
					)
				).id,
			);
	});

	it('success', async () => {
		await execute(() => svc.recie.readMany(recieversId), {
			exps: [{ type: 'toBeInstanceOf', params: [Array<Reciever>] }],
			onFinish: async (result) => {
				for (let i = 0; i < 5; i++)
					await execute(
						() => svc.recie.findOne({ id: result[i].id, cache: false }),
						{
							exps: [
								{ type: 'toHaveProperty', params: ['isRead', true] },
								{ type: 'toHaveProperty', params: ['readAt', null], not: true },
							],
						},
					);
			},
		});
	});
});
