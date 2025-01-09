import { AppService } from 'app/app.service';
import { EventTag } from './tag.entity';
import { execute, initJest } from 'app/utils/test.utils';
import { Event } from 'event/event.entity';

const fileName = curFile(__filename);

let svc: AppService, eventTag: EventTag;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	eventTag = EventTag.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => svc.eventTag.assign(eventTag), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => svc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});

	it('success when already assigned', async () => {
		await svc.eventTag.assign(eventTag);

		await execute(() => svc.eventTag.assign(eventTag), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => svc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});

describe('attach', () => {
	it('success', async () => {
		const event = Event.test(fileName),
			assignedEvent = await svc.event.assign(event);

		await svc.eventTag.assign(eventTag);

		await execute(() => svc.eventTag.attach(eventTag, assignedEvent.id), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => svc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
				await execute(() => svc.event.findOne({ tags: [{ id: result.id }] }), {
					exps: [{ type: 'toBeDefined', params: [] }],
				});
			},
		});
	});
});
