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
				await execute(
					() => svc.eventTag.find({ id: result.id, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
			},
		});
	});

	it('success when already assigned', async () => {
		await svc.eventTag.assign(eventTag);

		await execute(() => svc.eventTag.assign(eventTag), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(
					() => svc.eventTag.find({ id: result.id, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
			},
		});
	});
});

describe('attach', () => {
	it('success', async () => {
		const event = Event.test(fileName),
			{ id: eventId } = await svc.event.assign(event),
			{ id: tagId } = await svc.eventTag.assign(eventTag);

		await execute(() => svc.eventTag.attach(eventTag, eventId), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(() => svc.eventTag.find({ id: tagId, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
				await execute(
					() =>
						svc.event.findOne({
							id: eventId,
							tags: [{ id: eventId }],
							cache: false,
						}),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
			},
		});
	});
});

describe('modify', () => {
	it('success', async () => {
		const name = (30).string,
			{ id } = await svc.eventTag.assign(eventTag);

		await execute(() => svc.eventTag.modify(id, { name }), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(() => svc.eventTag.find({ name, id, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});
