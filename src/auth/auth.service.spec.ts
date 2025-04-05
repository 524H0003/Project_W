import { expect } from '@jest/globals';
import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let svc: AppService, user: User;

beforeEach(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	user = User.test(fileName);
});

describe('signUp', () => {
	it('success', async () => {
		await execute(() => svc.auth.signUp({ ...user, ...user.baseUser }, null), {
			exps: [{ type: 'toBeInstanceOf', params: [User] }],
		});
	});

	it('failed due to existed email', async () => {
		await svc.auth.signUp({ ...user, ...user.baseUser }, null);

		await execute(() => svc.auth.signUp({ ...user, ...user.baseUser }, null), {
			exps: [{ type: 'toThrow', params: [err('Invalid', 'User', 'SignUp')] }],
		});
	});

	it('failed due to invalid validation', async () => {
		await execute(
			() => svc.auth.signUp({ ...user, ...user.baseUser, password: '1' }, null),
			{
				exps: [
					{ type: 'toThrow', params: [err('Invalid', 'Entity', 'SignUp')] },
				],
			},
		);
	});
});

describe('login', () => {
	let dbUser: User;
	beforeEach(async () => {
		dbUser = await svc.auth.signUp({ ...user, ...user.baseUser }, null);
	});

	it('success', async () => {
		await execute(() => svc.auth.login({ ...user, ...user.baseUser }), {
			exps: [{ type: 'toBeInstanceOf', params: [User] }],
			onFinish(result) {
				expect(result.info).toEqual(dbUser.info);
			},
		});
	});

	it('failed due to invalid email', async () => {
		await execute(
			() =>
				svc.auth.login({ ...user, ...user.baseUser, email: 'lmao@lmao.com' }),
			{ exps: [{ type: 'toThrow', params: ['Invalid_Email'] }] },
		);
	});

	it('failed due to invalid password', async () => {
		await execute(
			() =>
				svc.auth.login({ ...user, ...user.baseUser, password: (64).string }),
			{ exps: [{ type: 'toThrow', params: ['Invalid_Password'] }] },
		);
	});
});

it('changePassword', async () => {
	const dbUser = await svc.auth.signUp({ ...user, ...user.baseUser }, null),
		newPassword = (20).string + 'aA1!';

	await execute(() => svc.auth.changePassword(dbUser, newPassword), {
		exps: [{ type: 'toThrow', not: true, params: [] }],
		onFinish: async () => {
			await execute(
				() =>
					svc.auth.login({ ...user, ...user.baseUser, password: newPassword }),
				{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
			);
		},
	});
	await execute(
		() => svc.auth.login({ ...user.baseUser, password: newPassword }),
		{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
	);
});
