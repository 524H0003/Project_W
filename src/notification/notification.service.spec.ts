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
		await execute(() => svc.noti.assign(notification), {
			exps: [{ type: 'toBeInstanceOf', params: [Notification] }],
			onFinish: async (result) => {
				await execute(() => svc.noti.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});

describe('modify', () => {
	it('success', async () => {
		const newContent = 'Edited' + (30).string,
			rawNoti = await svc.noti.assign(notification);

		await execute(() => svc.noti.modify(rawNoti.id, { content: newContent }), {
			exps: [
				{ type: 'toBeInstanceOf', params: [Notification] },
				{ type: 'toHaveProperty', params: ['content', newContent] },
			],
		});
	});
});
