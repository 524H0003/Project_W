import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { User, UserRecieve } from 'user/user.entity';
import { Hook } from './hook.entity';

const fileName = curFile(__filename);

let appSvc: AppService;

beforeEach(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

describe('HookService', () => {
	it('assign', async () => {
		const mtdt = fileName + '_' + (20).string;
		let signature: string;

		await execute(
			() =>
				appSvc.hook.assign(
					mtdt,
					(s: string) => {
						signature = s;
					},
					'_Email',
				),
			{
				exps: [{ type: 'toBeInstanceOf', params: [UserRecieve] }],
				onFinish: async (result: UserRecieve) => {
					const token: { id: string } = appSvc.sign.verify(result.accessToken, {
						type: 'access',
					}) as { id: string };

					await execute(() => appSvc.hook.id(token.id), {
						exps: [
							{ type: 'toBeDefined', params: [] },
							{
								type: 'toMatchObject',
								params: [
									new Hook({ signature, mtdt, note: null, fromUser: null }),
								],
							},
						],
					});
				},
			},
		);
	});

	it('assign with user', async () => {
		const mtdt = fileName + '_' + (20).string;
		let user: User;

		await execute(
			() =>
				appSvc.hook.assign(
					mtdt,
					async () => {
						user = User.test(fileName);
						return (
							await appSvc.auth.signUp({ ...user, ...user.baseUser }, null)
						).baseUser;
					},
					'_Email',
				),
			{
				exps: [{ type: 'toBeInstanceOf', params: [UserRecieve] }],
				onFinish: async (result: UserRecieve) => {
					const token: { id: string } = appSvc.sign.verify(result.accessToken, {
						type: 'access',
					}) as { id: string };

					await execute(() => appSvc.hook.id(token.id), {
						exps: [
							{ type: 'toBeDefined', params: [] },
							{
								type: 'toBeInstanceOf',
								params: [Hook],
							},
						],
					});
				},
			},
		);
	});

	it('validating', async () => {
		const mtdt = fileName + '_' + (20).string;
		let signature: string;

		const userRecieve = await appSvc.hook.assign(
				mtdt,
				(s: string) => {
					signature = s;
				},
				'_Console',
			),
			token: { id: string } = appSvc.sign.verify(userRecieve.accessToken, {
				type: 'access',
			}) as { id: string },
			hook = await appSvc.hook.id(token.id);

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () => appSvc.hook.validating(signature, mtdt, hook),
			{ exps: [{ type: 'toThrow', not: true, params: [] }] },
		);
	});

	it('validating failed', async () => {
		const mtdt = fileName + '_' + (20).string,
			signature = (5).string;

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				appSvc.hook.validating(
					signature,
					mtdt,
					new Hook({
						mtdt,
						signature: signature + '-',
						note: null,
						fromUser: null,
					}),
				),
			{
				throwError: true,
				exps: [{ type: 'toThrow', params: ['Invalid_Hook_Signature'] }],
			},
		);
	});
});
