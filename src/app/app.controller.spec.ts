import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { AppService } from './app.service';
import { expect, it } from '@jest/globals';
import { LightMyRequestChain } from 'fastify';
import { OutgoingHttpHeaders } from 'http2';

const fileName = curFile(__filename);

let req: () => LightMyRequestChain, usr: User, rfsTms: number, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

beforeEach(() => {
	usr = User.test(fileName);
});

describe('signup', () => {
	it('success', async () => {
		await execute(
			() =>
				req()
					.post('/signup')
					.body({ ...usr, ...usr.baseUser }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
				],
			},
		);

		delete usr.password;

		await execute(() => svc.user.email(usr.baseUser.email), {
			exps: [
				{ type: 'toBeInstanceOf', params: [User] },
				{
					type: 'toMatchObject',
					params: [
						{ ...usr, baseUser: { email: usr.baseUser.email.toLowerCase() } },
					],
				},
			],
		});
	});

	it('fail due to email already exist', async () => {
		await req()
			.post('/signup')
			.body({ ...usr, ...usr.baseUser });

		await execute(
			async () =>
				(
					await req()
						.post('/signup')
						.body({ ...usr, ...usr.baseUser })
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Invalid', 'User', 'SignUp')] },
				],
			},
		);
	});
});

describe('login', () => {
	beforeEach(
		async () =>
			await req()
				.post('/signup')
				.body({ ...usr, ...usr.baseUser }),
	);

	it('success', async () => {
		await execute(
			() =>
				req()
					.post('/login')
					.body({ ...usr, ...usr.baseUser }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
				],
			},
		);

		await execute(
			() =>
				svc.device.find({
					owner: { baseUser: { email: usr.baseUser.email.lower } },
				}),
			{ exps: [{ type: 'toHaveLength', params: [2] }] },
		);
	});

	it('fail due to wrong password', async () => {
		usr = new User({ ...usr, ...usr.baseUser, password: (12).string });

		await execute(
			async () =>
				(
					await req()
						.post('/login')
						.body({ ...usr, ...usr.baseUser })
				).body,
			{
				exps: [{ type: 'toContain', params: [err('Invalid', 'Password', '')] }],
			},
		);
	});

	it('fail due to invalid email', async () => {
		usr = new User({ ...usr, ...usr.baseUser, email: (20).string });

		await execute(
			async () =>
				(
					await req()
						.post('/login')
						.body({ ...usr, ...usr.baseUser })
				).body,
			{ exps: [{ type: 'toContain', params: [err('Invalid', 'Email', '')] }] },
		);
	});
});

describe('logout', () => {
	let headers: OutgoingHttpHeaders;

	beforeEach(
		async () =>
			({ headers } = await req()
				.post('/signup')
				.body({ ...usr, ...usr.baseUser })),
	);

	it('success', async () => {
		await execute(
			() => req().post('/logout').headers({ cookie: headers['set-cookie'] }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['headers.set-cookie', expect.arrayContaining([])],
					},
				],
				onFinish: () =>
					execute(
						() =>
							svc.device.find({
								owner: { baseUser: { email: usr.baseUser.email.lower } },
							}),
						{ exps: [{ type: 'toHaveLength', params: [0] }] },
					),
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(async () => (await req().post('/logout')).body, {
			exps: [
				{ type: 'toContain', params: [err('Unauthorized', 'User', 'Access')] },
			],
		});
	});
});

describe('refresh', () => {
	let headers: OutgoingHttpHeaders;

	beforeEach(
		async () =>
			({ headers } = await req()
				.post('/signup')
				.body({ ...usr, ...usr.baseUser })),
	);

	it('success', async () => {
		await execute(
			() => req().post('/refresh').headers({ cookie: headers['set-cookie'] }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie'] as unknown[]),
						],
					},
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
				],
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(async () => (await req().post('/refresh')).body, {
			exps: [
				{ type: 'toContain', params: [err('Unauthorized', 'User', 'Access')] },
			],
		});
	});

	it('success in generate new key', async () => {
		await execute(
			async () =>
				await req().post('/refresh').headers({ cookie: headers['set-cookie'] }),
			{
				numOfRun: rfsTms * 1.2,
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie'] as unknown[]),
						],
					},
					{
						type: 'toHaveProperty',
						params: [
							'headers.set-cookie',
							expect.arrayContaining([expect.anything(), expect.anything()]),
						],
					},
				],
			},
		);
	});
});

describe('change-password', () => {
	let user: User;

	it('success', async () => {
		const rawUser = User.test(fileName);
		user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null);

		await execute(
			async () =>
				(
					await req()
						.post('/change-password')
						.body({ email: user.baseUser.email })
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});

	it('failed', async () => {
		const rawUser = User.test(fileName);
		user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null);

		await execute(
			async () =>
				(
					await req()
						.post('/change-password')
						.body({ email: user.baseUser.email + ']' })
				).body,
			{ exps: [{ type: 'toContain', params: ['Invalid_Email'] }] },
		);
	});
});

describe('request-signature', () => {
	it('success', async () => {
		await execute(
			async () =>
				(
					await req()
						.post('/request-signature')
						.body({ email: svc.cfg.get('ADMIN_EMAIL') })
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});
});
