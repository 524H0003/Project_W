import { AppService } from 'app/app.service';
import { EventTag } from './tag.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'app/module/test.module';
import { AppModule } from 'app/app.module';
import { execute } from 'app/utils/test.utils';
import { Event } from 'event/event.entity';

const fileName = curFile(__filename);

let appSvc: AppService, eventTag: EventTag;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	eventTag = EventTag.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
		await execute(() => appSvc.eventTag.assign(eventTag), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => appSvc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});

	it('success when already assigned', async () => {
		await appSvc.eventTag.assign(eventTag);

		await execute(() => appSvc.eventTag.assign(eventTag), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => appSvc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});

describe('attach', () => {
	it('success', async () => {
		const event = Event.test(fileName),
			assignedEvent = await appSvc.event.assign(event);

		await appSvc.eventTag.assign(eventTag);

		await execute(() => appSvc.eventTag.attach(eventTag, assignedEvent.id), {
			exps: [{ type: 'toBeInstanceOf', params: [EventTag] }],
			onFinish: async (result: EventTag) => {
				await execute(() => appSvc.eventTag.find({ id: result.id }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
				await execute(
					() => appSvc.event.findOne({ tags: [{ id: result.id }] }),
					{ exps: [{ type: 'toBeDefined', params: [] }] },
				);
			},
		});
	});
});
