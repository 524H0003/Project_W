import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { Event } from './event.entity';
import { execute } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let appSvc: AppService, event: Event;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	event = Event.test(fileName);
});

it('assign', async () => {
	await execute(() => appSvc.event.assign(event), {
		exps: [{ type: 'toBeInstanceOf', params: [Event] }],
		onFinish: async (result: Event) => {
			await execute(() => appSvc.event.find({ id: result.id }), {
				exps: [{ type: 'toHaveLength', params: [1] }],
			});
		},
	});
});

it('modify', async () => {
	const curEvent = await appSvc.event.assign(event),
		newDescription = (45).string;

	await execute(
		() => appSvc.event.modify(curEvent.id, { description: newDescription }),
		{
			exps: [
				{ type: 'toBeInstanceOf', params: [Event] },
				{ type: 'toHaveProperty', params: ['description', newDescription] },
			],
		},
	);
});

it('remove', async () => {
	const curEvent = await appSvc.event.assign(event);

	// eslint-disable-next-line @typescript-eslint/require-await
	await execute(async () => () => appSvc.event.remove(curEvent.id), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => appSvc.event.id(curEvent.id), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});
