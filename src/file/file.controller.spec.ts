import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthModule } from 'auth/auth.module';
import cookieParser from 'cookie-parser';
import { FileController } from 'file/file.controller';
import { FileModule } from 'file/file.module';
import { TestModule } from 'module/test.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { execute } from 'utils/test.utils';

const fileName = curFile(__filename);
let rawUsr: User,
	req: TestAgent,
	app: INestApplication,
	usrRepo: Repository<User>;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, FileModule, AuthModule],
		controllers: [FileController],
	}).compile();

	(app = module.createNestApplication()),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (rawUsr = User.test(fileName));
});

describe('seeUploadedFile', () => {
	let headers: object, usr: User;

	beforeEach(async () => {
		({ headers } = await req
			.post('/auth/signup')
			.attach('avatar', Buffer.from('test', 'base64'), 'avatar.png')
			.field('name', rawUsr.name)
			.field('phone', rawUsr.phone)
			.field('email', rawUsr.email)
			.field('password', rawUsr.password));
		usr = await usrRepo.findOne({ where: { email: rawUsr.email } });
	});

	it('success on server files', async () => {
		await execute(
			() =>
				req
					.get('/file/testcard.server.png')
					.set('Cookie', headers['set-cookie']),
			{
				exps: [
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('success', async () => {
		await execute(
			() =>
				req
					.get(`/file/${usr.avatarFilePath}`)
					.set('Cookie', headers['set-cookie']),
			{
				exps: [
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('failed', async () => {
		await execute(() => req.get(`/file/${usr.avatarFilePath}`), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
				{
					type: 'toHaveProperty',
					params: ['text', JSON.stringify({ error: 'Invalid request' })],
				},
			],
		});
	});
});
