import { AppService } from 'app/app.service';
import { Notification } from './notification.entity';
import { execute, initJest } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let svc: AppService, notification: Notification;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	notification = Notification.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => svc.notification.assign(notification), {
			exps: [{ type: 'toBeInstanceOf', params: [Notification] }],
			onFinish: async (result) => {
				await execute(
					() => svc.notification.find({ id: result.id, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
			},
		});
	});
});

describe('modify', () => {
	it('success', async () => {
		const newContent = 'Edited' + (30).string,
			rawNoti = await svc.notification.assign(notification);

		await execute(
			() => svc.notification.modify(rawNoti.id, { content: newContent }),
			{
				exps: [{ type: 'toThrow', not: true, params: [] }],
				onFinish: async () => {
					await execute(
						() => svc.notification.find({ content: newContent, cache: false }),
						{ exps: [{ type: 'toHaveLength', params: [1] }] },
					);
				},
			},
		);
	});
});
