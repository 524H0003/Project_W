import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { Hook } from './hook.entity';
import { UAParser } from 'ua-parser-js';
import { MetaData } from 'auth/guards';
import { BaseUser } from 'user/base/baseUser.entity';

const fileName = curFile(__filename);

let svc: AppService, mtdt: MetaData;

beforeEach(async () => {
	const { appSvc } = await initJest();

	(svc = appSvc),
		(mtdt = new UAParser(fileName + '_' + (20).string).getResult());
});

describe('assign', () => {
	it('success', async () => {
		let user: User;

		await execute(
			() =>
				svc.hook.assign(mtdt, async () => {
					user = User.test(fileName);

					return (await svc.auth.signUp({ ...user, ...user.baseUser }, null))
						.baseUser;
				}),
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async ({ id }) => {
					await execute(() => svc.hook.id(id), {
						exps: [
							{ type: 'toBeDefined', params: [] },
							{ type: 'toBeInstanceOf', params: [Hook] },
						],
					});
				},
			},
		);
	});
});

describe('validating', () => {
	let hook: Hook = null,
		signature: string;

	beforeEach(async () => {
		hook = await svc.hook.assign(mtdt, (s: string) => {
			signature = s;
			return BaseUser.test(fileName);
		});
	});

	it('success', async () => {
		await execute(() => svc.hook.validating(signature, mtdt, hook), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
		});
	});

	it('failed due to invalid signature', async () => {
		await execute(
			() =>
				svc.hook.validating(
					signature,
					mtdt,
					new Hook({
						...hook,
						signature: signature + '-',
					}),
				),
			{ exps: [{ type: 'toThrow', params: [err('Invalid', 'Hook', '')] }] },
		);
	});
});

describe('modify', () => {
	it('success', async () => {
		await execute(() => svc.hook.modify(null, null), {
			exps: [
				{ type: 'toThrow', not: true, params: [] },
				{ type: 'toBeUndefined', params: [] },
			],
		});
	});
});
