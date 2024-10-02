import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { execute } from 'utils/test.utils';
import { User } from './user.entity';
import { UserModule } from './user.module';

const fileName = curFile(__filename);
let usr: User, req: TestAgent, app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [UserModule, TestModule],
	}).compile();

	app = module.createNestApplication();

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = User.test(fileName));
});

describe('getUser', () => {
	let headers: object;

	beforeEach(
		async () => ({ headers } = await req.post('/auth/signup').send(usr)),
	);

	it('success', async () => {
		await execute(
			() => req.post('/user').set('Cookie', headers['set-cookie']),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['text', JSON.stringify(usr.info)],
					},
				],
			},
		);
	});

	it('fail', async () => {
		await execute(() => req.post('/user').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
		});
	});
});
