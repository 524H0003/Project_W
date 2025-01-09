import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User, UserRecieve } from 'user/user.entity';
import { Hook } from './hook.entity';

const fileName = curFile(__filename);

let svc: AppService;

beforeEach(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

it('assign', async () => {
	const mtdt = fileName + '_' + (20).string;
	let signature: string;

	await execute(
		() =>
			svc.hook.assign(
				mtdt,
				(s: string) => {
					signature = s;
				},
				'_Email',
			),
		{
			exps: [{ type: 'toBeInstanceOf', params: [UserRecieve] }],
			onFinish: async (result: UserRecieve) => {
				const token: { id: string } = svc.sign.verify(result.accessToken, {
					type: 'access',
				}) as { id: string };

				await execute(() => svc.hook.id(token.id), {
					exps: [
						{ type: 'toBeDefined', params: [] },
						{
							type: 'toMatchObject',
							params: [
								new Hook({ signature, mtdt, note: null, fromBaseUser: null }),
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
			svc.hook.assign(
				mtdt,
				async () => {
					user = User.test(fileName);
					return (await svc.auth.signUp({ ...user, ...user.baseUser }, null))
						.baseUser;
				},
				'_Email',
			),
		{
			exps: [{ type: 'toBeInstanceOf', params: [UserRecieve] }],
			onFinish: async (result: UserRecieve) => {
				const token: { id: string } = svc.sign.verify(result.accessToken, {
					type: 'access',
				}) as { id: string };

				await execute(() => svc.hook.id(token.id), {
					exps: [
						{ type: 'toBeDefined', params: [] },
						{ type: 'toBeInstanceOf', params: [Hook] },
					],
				});
			},
		},
	);
});

it('validating', async () => {
	const mtdt = fileName + '_' + (20).string;
	let signature: string;

	const userRecieve = await svc.hook.assign(
			mtdt,
			(s: string) => {
				signature = s;
			},
			'_Admin',
		),
		token: { id: string } = svc.sign.verify(userRecieve.accessToken, {
			type: 'access',
		}) as { id: string },
		hook = await svc.hook.id(token.id);

	await execute(
		// eslint-disable-next-line @typescript-eslint/require-await
		async () => () => svc.hook.validating(signature, mtdt, hook),
		{ exps: [{ type: 'toThrow', not: true, params: [] }] },
	);
});

it('validating failed', async () => {
	const mtdt = fileName + '_' + (20).string,
		signature = (5).string;

	await execute(
		// eslint-disable-next-line @typescript-eslint/require-await
		async () => () =>
			svc.hook.validating(
				signature,
				mtdt,
				new Hook({
					mtdt,
					signature: signature + '-',
					note: null,
					fromBaseUser: null,
				}),
			),
		{
			throwError: true,
			exps: [{ type: 'toThrow', params: ['Invalid_Hook_Signature'] }],
		},
	);
});
