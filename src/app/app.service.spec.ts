import { AppService } from './app.service';
import { execute, initJest } from './utils/test.utils';
import { BaseUser } from './app.entity';

const fileName = curFile(__filename);

let svc: AppService;

beforeEach(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

describe('BaseUserService', () => {
	it('assign', async () => {
		const { name, email } = BaseUser.test(fileName);

		await execute(() => svc.baseUser.assign({ name, email }), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{ type: 'toMatchObject', params: [{ name, email: email.lower }] },
			],
		});
	});

	it('modify', async () => {
		const { name, email } = BaseUser.test(fileName),
			newName = (5).string + '_' + name,
			baseUser = await svc.baseUser.assign({ name, email });

		await execute(() => svc.baseUser.modify(baseUser.id, { name: newName }), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(() => svc.baseUser.find({ name: newName }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
		await execute(() => svc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
	});

	it('remove', async () => {
		const { name, email } = BaseUser.test(fileName),
			usr = await svc.baseUser.assign({ name, email });

		await execute(() => svc.baseUser.remove(usr.id), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
		await execute(() => svc.baseUser.findOne({ email, name }), {
			exps: [{ type: 'toEqual', params: [{}] }],
		});
	});

	it('email', async () => {
		const { name, email } = BaseUser.test(fileName);

		await svc.baseUser.assign({ name, email });

		await execute(() => svc.baseUser.email(email), {
			exps: [
				{ type: 'toBeInstanceOf', params: [BaseUser] },
				{ type: 'toMatchObject', params: [{ email: email.lower, name }] },
			],
		});
	});
});
