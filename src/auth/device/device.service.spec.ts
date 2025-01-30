import { AppService } from 'app/app.service';
import { Device } from './device.entity';
import { execute, initJest } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let svc: AppService;

beforeEach(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

it('assign', async () => {
	const device = Device.test(fileName);

	await execute(() => svc.device.assign(device), {
		exps: [
			{ type: 'toBeInstanceOf', params: [Device] },
			{ type: 'toMatchObject', params: [device] },
		],
	});
});

it('modify', async () => {
	const rawDevice = Device.test(fileName),
		device = await svc.device.assign(rawDevice),
		newMtdt = (5).string + '_' + fileName;

	await execute(() => svc.device.modify(device.id, { child: newMtdt }), {
		exps: [
			{ type: 'toBeInstanceOf', params: [Device] },
			{ type: 'toMatchObject', params: [{ child: newMtdt }] },
		],
	});
	await execute(() => svc.device.findOne(device), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});

it('remove', async () => {
	const device = Device.test(fileName);

	await svc.device.assign(device);

	await execute(() => svc.device.remove({ id: device.id }), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
	});
	await execute(() => svc.device.findOne(device), {
		exps: [{ type: 'toBeNull', params: [] }],
	});
});
