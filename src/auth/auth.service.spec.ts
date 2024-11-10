import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let appSvc: AppService, user: User;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {
	user = User.test(fileName);
});

describe('AuthService', () => {
	describe('signUp', () => {
		it('success', async () => {
			await execute(
				() => appSvc.auth.signUp({ ...user, ...user.baseUser }, null),
				{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
			);
		});

		it('failed due to existed email', async () => {
			await appSvc.auth.signUp({ ...user, ...user.baseUser }, null);

			await execute(
				// eslint-disable-next-line @typescript-eslint/require-await
				async () => () =>
					appSvc.auth.signUp({ ...user, ...user.baseUser }, null),
				{
					throwError: true,
					exps: [{ type: 'toThrow', params: ['Exist_User'] }],
				},
			);
		});
	});

	describe('login', () => {
		let dbUser: User;
		beforeEach(async () => {
			dbUser = await appSvc.auth.signUp({ ...user, ...user.baseUser }, null);
		});

		it('success', async () => {
			await execute(() => appSvc.auth.login({ ...user, ...user.baseUser }), {
				exps: [
					{ type: 'toBeInstanceOf', params: [User] },
					{ type: 'toEqual', params: [dbUser] },
				],
			});
		});

		it('failed due to invalid email', async () => {
			await execute(
				// eslint-disable-next-line @typescript-eslint/require-await
				async () => () =>
					appSvc.auth.login({
						...user,
						...user.baseUser,
						email: 'lmao@lmao.com',
					}),
				{
					throwError: true,
					exps: [{ type: 'toThrow', params: ['Invalid_Email'] }],
				},
			);
		});

		it('failed due to invalid password', async () => {
			await execute(
				// eslint-disable-next-line @typescript-eslint/require-await
				async () => () =>
					appSvc.auth.login({
						...user,
						...user.baseUser,
						password: (64).string,
					}),
				{
					throwError: true,
					exps: [{ type: 'toThrow', params: ['Invalid_Password'] }],
				},
			);
		});
	});

	it('changePassword', async () => {
		const dbUser = await appSvc.auth.signUp(
				{ ...user, ...user.baseUser },
				null,
			),
			newPassword = (20).string + 'aA1!';

		await execute(() => appSvc.auth.changePassword(dbUser, newPassword), {
			exps: [
				{ type: 'toBeInstanceOf', params: [User] },
				{
					type: 'toMatchObject',
					params: [{ baseUser: dbUser.baseUser }],
				},
			],
		});
		await execute(
			() => appSvc.auth.login({ ...user.baseUser, password: newPassword }),
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
		// eslint-disable-next-line @typescript-eslint/require-await
		await execute(async () => appSvc.sign.refresh(id), {
			exps: [{ type: 'toBeDefined', params: [] }],
			onFinish: async (result: string) => {
				await execute(
					// eslint-disable-next-line @typescript-eslint/require-await
					async () => appSvc.sign.verify(result, { type: 'refresh' }),
					{
						exps: [{ type: 'toMatchObject', params: [{ id }] }],
					},
				);
			},
		});
	});

	it('access', async () => {
		// eslint-disable-next-line @typescript-eslint/require-await
		await execute(async () => appSvc.sign.access(id), {
			exps: [{ type: 'toBeDefined', params: [] }],
			onFinish: async (result: string) => {
				await execute(
					// eslint-disable-next-line @typescript-eslint/require-await
					async () => appSvc.sign.verify(result, { type: 'access' }),
					{
						exps: [{ type: 'toMatchObject', params: [{ id }] }],
					},
				);
			},
		});
	});
});
