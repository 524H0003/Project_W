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
	if (rawUser.hashedPassword) true;

	(notification = await svc.noti.assign(Notification.test(fileName))),
		(user = await svc.user.assign(rawUser));
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => svc.recie.assign(notification.id, user.baseUser.id), {
			exps: [{ type: 'toBeInstanceOf', params: [Reciever] }],
			onFinish: async (result) => {
				await execute(
					() =>
						svc.user.findOne({
							recievedNotifications: [{ id: result.id }],
							baseUser: { id: user.baseUser.id },
						}),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
				await execute(
					() =>
						svc.noti.findOne({
							sent: [{ id: result.id }],
							id: notification.id,
						}),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
			},
		});
	});
});

describe('assign', () => {
	const usersId: string[] = [];

	beforeEach(async () => {
		for (let i = 0; i < 5; i++) {
			const tUser = User.test(fileName);
			if (tUser.hashedPassword) true;
			usersId.push((await svc.user.assign(tUser)).baseUser.id);
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
		});
	});
});
