import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { UserModule } from './user.module';
import { User } from './user.entity';
import { UserRole } from './user.model';

const fileName = curFile(__filename),
	userGet = 'fullName';
let app: INestApplication,
	usr: User,
	req: TestAgent,
	usrRepo: Repository<User>,
	headers: object,
	usrRaw: User;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, UserModule],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(usr = User.test(fileName)),
		({ headers } = await req.post('/auth/signup').send(usr)),
		(usrRaw = await usrRepo.findOne({ where: { email: usr.email } }));
});

describe('findOne', () => {
	it('success', async () => {
		await usrRepo.save({ id: usrRaw.id, role: UserRole.student });

		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `query FindOne($findOneId: String!) {user(id: $findOneId) {${userGet}}}`,
						variables: { findOneId: usrRaw.id },
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['text', expect.stringContaining(JSON.stringify(usr.info))],
					},
				],
			},
		);
	});

	it('fail', async () => {
		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({
						query: `query FindOne($findOneId: String!) {user(id: $findOneId) {${userGet}}}`,
						variables: { findOneId: (12).string },
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: ['text', expect.stringContaining('error')],
					},
				],
			},
		);
	});
});

describe('findAll', () => {
	it('success', async () => {
		await usrRepo.save({ id: usrRaw.id, role: UserRole.faculty });

		await execute(
			() =>
				req
					.post('/graphql')
					.set('Cookie', headers['set-cookie'])
					.send({ query: `query FindAll {userAll {${userGet}}}` }),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'text',
							expect.stringContaining(JSON.stringify(usr.info).slice(1, -10)),
						],
					},
				],
			},
		);
	});
});
