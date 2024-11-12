import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { Device } from './device.entity';
import { execute } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let appSvc: AppService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

it('assign', async () => {
	const device = Device.test(fileName);

	await execute(() => appSvc.device.assign(device), {
		exps: [
			{ type: 'toBeInstanceOf', params: [Device] },
			{ type: 'toMatchObject', params: [device] },
		],
	});
});

it('modify', async () => {
	const rawDevice = Device.test(fileName),
		device = await appSvc.device.assign(rawDevice),
		newMtdt = (5).string + '_' + fileName;

	await execute(() => appSvc.device.modify(device.id, { child: newMtdt }), {
		exps: [
			{ type: 'toBeInstanceOf', params: [Device] },
			{
				type: 'toMatchObject',
				params: [{ child: newMtdt }],
			},
		],
	});
	await execute(() => appSvc.device.findOne(device), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});

it('remove', async () => {
	const device = Device.test(fileName);

	await appSvc.device.assign(device);

	// eslint-disable-next-line @typescript-eslint/require-await
	await execute(async () => () => appSvc.device.remove({ id: device.id }), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => appSvc.device.findOne(device), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});
