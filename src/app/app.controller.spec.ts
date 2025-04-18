import {
	execute,
	getCookie,
	initJest,
	RequesterType,
} from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { AppService } from './app.service';
import { expect, it } from '@jest/globals';
import { OutgoingHttpHeaders } from 'http';
import { MailerService } from '@nestjs-modules/mailer';
import { HttpStatus } from '@nestjs/common';

const fileName = curFile(__filename);

let req: RequesterType,
	user: User,
	svc: AppService,
	mailerSvc: MailerService,
	headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { appSvc, requester, module } = await initJest();

	(mailerSvc = module.get(MailerService)), (svc = appSvc), (req = requester);
});

beforeEach(() => {
	user = User.test(fileName);
});

describe('signUp', () => {
	it('success', async () => {
		await execute(
			() =>
				req()
					.post('/sign-up')
					.body({ ...user, ...user.baseUser }),
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

		delete user.password;

		await execute(() => svc.user.email(user.baseUser.email), {
			exps: [
				{ type: 'toBeInstanceOf', params: [User] },
				{
					type: 'toHaveProperty',
					params: [
						'baseUser',
						expect.objectContaining({
							email: user.baseUser.email.toLowerCase(),
						}),
					],
				},
			],
		});
		await execute(
			async () =>
				svc.bloc.find({
					owner: { baseUser: { email: user.baseUser.email.lower } },
					cache: false,
				}),
			{ exps: [{ type: 'toHaveLength', params: [1] }] },
		);
	});

	it('fail due to email already exist', async () => {
		await req()
			.post('/sign-up')
			.body({ ...user, ...user.baseUser });

		await execute(
			async () =>
				(
					await req()
						.post('/sign-up')
						.body({ ...user, ...user.baseUser })
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
				.post('/sign-up')
				.body({ ...user, ...user.baseUser }),
	);

	it('success', async () => {
		await execute(
			async () =>
				(
					await req()
						.post('/login')
						.body({ ...user, ...user.baseUser })
				).statusCode,
			{ exps: [{ type: 'toEqual', params: [HttpStatus.CREATED] }] },
		);

		await execute(
			async () =>
				svc.bloc.find({
					owner: { baseUser: { email: user.baseUser.email.lower } },
					cache: false,
				}),
			{ exps: [{ type: 'toHaveLength', params: [2] }] },
		);
	});

	it('fail due to wrong password', async () => {
		user = new User({ ...user, password: (12).string });

		await execute(
			async () =>
				(
					await req()
						.post('/login')
						.body({ ...user, ...user.baseUser })
				).body,
			{
				exps: [{ type: 'toContain', params: [err('Invalid', 'Password', '')] }],
			},
		);
	});

	it('fail due to invalid email', async () => {
		user = new User({
			...user,
			baseUser: { ...user.baseUser, email: (20).string },
		});

		await execute(
			async () =>
				(
					await req()
						.post('/login')
						.body({ ...user, ...user.baseUser })
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
				.post('/sign-up')
				.body({ ...user, ...user.baseUser })),
	);

	it('success', async () => {
		await execute(
			() =>
				req()
					.post('/logout')
					.headers({ cookie: getCookie(headers['set-cookie']) }),
			{
				exps: [{ type: 'toThrow', not: true, params: [] }],
				onFinish: async () => {
					await execute(
						async () =>
							svc.bloc.find({
								owner: { baseUser: { email: user.baseUser.email.lower } },
								cache: false,
							}),
						{ exps: [{ type: 'toHaveLength', params: [0] }] },
					);
				},
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
	beforeEach(
		async () =>
			({ headers } = await req()
				.post('/sign-up')
				.body({ ...user, ...user.baseUser })),
	);

	it('success', async () => {
		await execute(
			() =>
				req()
					.post('/refresh')
					.headers({ cookie: getCookie(headers['set-cookie']) }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						not: true,
						params: [
							'headers.set-cookie',
							expect.arrayContaining([...headers['set-cookie']]),
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

	it('success in throw invalid token due to used old token', async () => {
		const cookie = getCookie(headers['set-cookie']),
			newCookie = getCookie(
				(await req().post('/refresh').headers({ cookie })).headers[
					'set-cookie'
				],
			);

		await execute(
			async () => await req().post('/refresh').headers({ cookie }),
			{
				handleLoop: async (func) => {
					headers = (await func()).headers;
				},
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'body',
							expect.stringContaining(err('Invalid', 'User', 'Access')),
						],
					},
				],
			},
		);

		await execute(
			async () => await req().post('/refresh').headers({ cookie: newCookie }),
			{
				handleLoop: async (func) => {
					headers = (await func()).headers;
				},
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'body',
							expect.stringContaining(err('Invalid', 'User', 'Access')),
						],
					},
				],
			},
		);
	});

	it('fail when meta data not match', async () => {
		await execute(
			async () =>
				(
					await req()
						.post('/refresh')
						.headers({
							cookie: getCookie(headers['set-cookie']),
							'user-agent': (18).string,
						})
						.end()
				).body,
			{ exps: [{ type: 'toContain', params: [err('Invalid', 'Client', '')] }] },
		);
	});
});

describe('change-password', () => {
	let user: User;

	it('success', async () => {
		const rawUser = User.test(fileName);
		user = await svc.auth.signUp({ ...rawUser, ...rawUser.baseUser }, null);

		await execute(
			async () => {
				const { body, headers: h } = await req()
					.post('/change-password')
					.body({ email: user.baseUser.email });

				headers = h;

				return body;
			},
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
				onFinish: async () => {
					const signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0][
							'context'
						]['url']
							.split('/')
							.at(-1),
						password = (32).string;

					await execute(
						async () =>
							(
								await req()
									.post('/change-password/' + signature)
									.headers({ cookie: getCookie(headers['set-cookie']) })
									.body({ password })
							).body,
						{
							exps: [
								{
									type: 'toContain',
									params: [err('Success', 'Password', 'Implementation')],
								},
							],
							onFinish: async () => {
								await execute(
									async () =>
										(
											await req()
												.post('/login')
												.body({ email: user.baseUser.email, password })
										).statusCode,
									{ exps: [{ type: 'toEqual', params: [HttpStatus.CREATED] }] },
								);
							},
						},
					);
				},
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
						.body({ email: svc.config.get('ADMIN_EMAIL') })
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});

	it('fail due to invalid admin email', async () => {
		await execute(
			async () =>
				(await req().post('/request-signature').body({ email: (18).string }))
					.body,
			{ exps: [{ type: 'toContain', params: [err('Invalid', 'Email', '')] }] },
		);
	});
});

describe('csrf-token', () => {
	it('success', async () => {
		await execute(async () => (await req().get('/csrf-token').end()).body, {
			exps: [{ type: 'toContain', params: ['token'] }],
		});
	});
});

describe('health', () => {
	it('success', async () => {
		await execute(async () => (await req().get('/health').end()).body, {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});
