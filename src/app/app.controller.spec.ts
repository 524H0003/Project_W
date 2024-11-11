import { Test, TestingModule } from '@nestjs/testing';
import { execute } from 'app/utils/test.utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { AppController } from 'app/app.controller';
import { AppModule } from 'app/app.module';
import { Student } from 'university/student/student.entity';
import { AppService } from './app.service';

const fileName = curFile(__filename);

let req: TestAgent,
	usr: User,
	app: INestApplication,
	rfsTms: number,
	appSvc: AppService;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
		controllers: [AppController],
	}).compile();
	(appSvc = module.get(AppService)), (app = module.createNestApplication());

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = User.test(fileName));
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
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		});

		await execute(() => appSvc.user.email(usr.baseUser.email), {
			exps: [{ type: 'toBeInstanceOf', params: [User] }],
		});
	});

	it('fail due to email already exist', async () => {
		await req.post('/signup').send({ ...usr, ...usr.baseUser });

		await execute(() => req.post('/signup').send({ ...usr, ...usr.baseUser }), {
			exps: [
				{
					type: 'toHaveProperty',
					params: ['status', HttpStatus.UNPROCESSABLE_ENTITY],
				},
			],
		});
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
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		});

		await execute(
			() =>
				appSvc.device.find({
					owner: { baseUser: { email: usr.baseUser.email.lower } },
				}),
			{ exps: [{ type: 'toHaveLength', params: [2] }] },
		);
	});

	it('fail due to wrong password', async () => {
		usr = new User({ ...usr, ...user.baseUser, password: (12).string });

		await execute(() => req.post('/login').send({ ...usr, ...usr.baseUser }), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});

	it('fail due to not follow student email format', async () => {
		usr = Student.test(fileName, { email: 'aa' }).user;

		await execute(() => req.post('/login').send({ ...usr.baseUser, ...usr }), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
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
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
				onFinish: () =>
					execute(
						() =>
							appSvc.device.find({
								owner: { baseUser: { email: usr.baseUser.email.lower } },
							}),
						{ exps: [{ type: 'toHaveLength', params: [0] }] },
					),
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(() => req.post('/logout'), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
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
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('fail due to not have valid cookies', async () => {
		await execute(() => req.post('/refresh'), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
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
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});
});
