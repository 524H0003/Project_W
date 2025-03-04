import { AppService } from 'app/app.service';
import { Event } from './event.entity';
import { execute, initJest } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let svc: AppService, event: Event;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	event = Event.test(fileName);
});

it('assign', async () => {
	await execute(() => svc.event.assign(event), {
		exps: [{ type: 'toBeInstanceOf', params: [Event] }],
		onFinish: async (result: Event) => {
			await execute(() => svc.event.find({ id: result.id }), {
				exps: [{ type: 'toHaveLength', params: [1] }],
			});
		},
	});
});

it('modify', async () => {
	const curEvent = await svc.event.assign(event),
		newDescription = (45).string;

	await execute(
		() => svc.event.modify(curEvent.id, { description: newDescription }),
		{
			exps: [
				{ type: 'toBeInstanceOf', params: [Event] },
				{ type: 'toHaveProperty', params: ['description', newDescription] },
			],
		},
	);
});

it('remove', async () => {
	const curEvent = await svc.event.assign(event);

	await execute(() => svc.event.remove(curEvent.id), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => svc.event.id(curEvent.id), {
		exps: [{ type: 'toEqual', params: [{}] }],
	});
});
