import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { UserModule } from './user.module';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

const fileName = curFile(__filename);
let rawUsr: User,
	usr: User,
	req: TestAgent,
	app: INestApplication,
	usrRepo: Repository<User>;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, UserModule],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (rawUsr = User.test(fileName));
});

describe('getUser', () => {
	let headers: object;

	beforeEach(
		async () => (
			({ headers } = await req.post('/auth/signup').send(rawUsr)),
			(usr = await usrRepo.findOne({ where: { email: rawUsr.email } }))
		),
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
		await execute(() => req.post('/user').send(rawUsr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.UNAUTHORIZED] },
			],
		});
	});
});
