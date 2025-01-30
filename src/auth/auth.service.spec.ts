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

describe('AuthService', () => {
	describe('signUp', () => {
		it('success', async () => {
			await execute(
				() => svc.auth.signUp({ ...user, ...user.baseUser }, null),
				{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
			);
		});

		it('failed due to existed email', async () => {
			await svc.auth.signUp({ ...user, ...user.baseUser }, null);

			await execute(
				() => svc.auth.signUp({ ...user, ...user.baseUser }, null),
				{
					exps: [
						{ type: 'toThrow', params: [err('Invalid', 'User', 'SignUp')] },
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
				exps: [
					{ type: 'toBeInstanceOf', params: [User] },
					{ type: 'toEqual', params: [dbUser] },
				],
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
			exps: [
				{ type: 'toBeInstanceOf', params: [User] },
				{ type: 'toMatchObject', params: [{ baseUser: dbUser.baseUser }] },
			],
		});
		await execute(
			() => svc.auth.login({ ...user.baseUser, password: newPassword }),
			{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
		);
	});
});

describe('SignService', () => {
	let id: string;

	beforeEach(() => {
		id = (20).string;
	});

	it('refresh', async () => {
		await execute(() => svc.sign.refresh(id), {
			exps: [{ type: 'toBeDefined', params: [] }],
			onFinish: async (result: string) => {
				await execute(() => svc.sign.verify(result, { type: 'refresh' }), {
					exps: [{ type: 'toMatchObject', params: [{ id }] }],
				});
			},
		});
	});

	it('access', async () => {
		await execute(() => svc.sign.access(id), {
			exps: [{ type: 'toBeDefined', params: [] }],
			onFinish: async (result: string) => {
				await execute(() => svc.sign.verify(result, { type: 'access' }), {
					exps: [{ type: 'toMatchObject', params: [{ id }] }],
				});
			},
		});
	});
});
