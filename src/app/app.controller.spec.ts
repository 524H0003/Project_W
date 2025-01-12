import { execute, initJest } from 'app/utils/test.utils';
import { HttpStatus } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { AppService } from './app.service';

const fileName = curFile(__filename);

let req: TestAgent, usr: User, rfsTms: number, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

beforeEach(() => {
	usr = User.test(fileName);
});

describe('signup', () => {
	it('success', async () => {
		await execute(() => req.post('/signup').send({ ...usr, ...usr.baseUser }), {
			exps: [
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
			],
		});

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
		await req.post('/signup').send({ ...usr, ...usr.baseUser });

		await execute(
			async () =>
				(await req.post('/signup').send({ ...usr, ...usr.baseUser })).text,
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
		async () => await req.post('/signup').send({ ...usr, ...usr.baseUser }),
	);

	it('success', async () => {
		await execute(() => req.post('/login').send({ ...usr, ...usr.baseUser }), {
			exps: [
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
			],
		});

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
				(await req.post('/login').send({ ...usr, ...usr.baseUser })).text,
			{
				exps: [{ type: 'toContain', params: [err('Invalid', 'Password', '')] }],
			},
		);
	});
});

describe('logout', () => {
	let headers: object;

	beforeEach(
		async () =>
			({ headers } = await req
				.post('/signup')
				.send({ ...usr, ...usr.baseUser })),
	);

	it('success', async () => {
		await execute(
			() => req.post('/logout').set('Cookie', headers['set-cookie']),
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
		await execute(() => req.post('/logout'), {
			exps: [],
		});
	});
});

describe('refresh', () => {
	let headers: object;

	beforeEach(
		async () =>
			({ headers } = await req
				.post('/signup')
				.send({ ...usr, ...usr.baseUser })),
	);

	it('success', async () => {
		await execute(
			() => req.post('/refresh').set('Cookie', headers['set-cookie']),
			{
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie']),
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
		await execute(() => req.post('/refresh'), {
			exps: [],
		});
	});

	it('success in generate new key', async () => {
		await execute(
			async () =>
				({ headers } = await req
					.post('/refresh')
					.set('Cookie', headers['set-cookie'])),
			{
				numOfRun: rfsTms * 1.2,
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining(headers['set-cookie']),
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
					await req
						.post('/change-password')
						.send({ email: user.baseUser.email })
				).text,
			{
				exps: [{ type: 'toContain', params: ['Sent_Signature_Email'] }],
			},
		);
	});

	it('failed', async () => {
		const rawUser = User.test(fileName);
		user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null);

		await execute(
			async () =>
				(
					await req
						.post('/change-password')
						.send({ email: user.baseUser.email + ']' })
				).text,
			{
				exps: [{ type: 'toContain', params: ['Invalid_Email'] }],
			},
		);
	});
});

describe('request-signature', () => {
	it('success', async () => {
		await execute(
			async () => (await req.post('/request-signature').send()).text,
			{
				exps: [{ type: 'toContain', params: ['Sent_Signature_Admin'] }],
			},
		);
	});
});
