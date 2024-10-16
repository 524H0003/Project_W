import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AppController } from 'app.controller';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import { AuthModule } from 'auth/auth.module';
import { DeviceModule } from 'auth/device/device.module';
import { HookModule } from 'auth/hook/hook.module';
import { SessionModule } from 'auth/session/session.module';
import cookieParser from 'cookie-parser';
import { FileController } from 'file/file.controller';
import { FileModule } from 'file/file.module';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Repository } from 'typeorm';
import { UniversityModule } from 'university/university.module';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';

const fileName = curFile(__filename);
let rawUsr: User,
	req: TestAgent,
	app: INestApplication,
	usrRepo: Repository<User>,
	usrSvc: UserService;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [
			TestModule,
			FileModule,
			AuthModule,
			DeviceModule,
			HookModule,
			SessionModule,
			UniversityModule,
		],
		controllers: [FileController, AppController],
	}).compile();

	(app = module.createNestApplication()),
		(usrSvc = module.get(UserService)),
		(usrRepo = module.get(getRepositoryToken(User)));

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (rawUsr = User.test(fileName));
});

describe('seeUploadedFile', () => {
	let headers: object, usr: User;

	beforeEach(async () => {
		const e = await req
			.post('/signup')
			.attach('avatar', Buffer.from('test', 'base64'), 'avatar.png')
			.field('fullName', rawUsr.fullName)
			.field('email', rawUsr.email)
			.field('password', rawUsr.password);
		usr = await usrRepo.findOne({ where: { email: rawUsr.email } });

		headers = e.headers;

		await usrSvc.updateRole(usr.id, UserRole.admin);
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
				req.get(`/file/${usr.avatarPath}`).set('Cookie', headers['set-cookie']),
			{
				exps: [
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('failed', async () => {
		await execute(() => req.get(`/file/${usr.avatarPath}`), {
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
