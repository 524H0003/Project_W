import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from 'app/app.controller';
import { TestModule } from 'app/module/test.module';
import { execute } from 'app/utils/test.utils';
import cookieParser from 'cookie-parser';
import { FileController } from 'file/file.controller';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';

const fileName = curFile(__filename);
let rawUsr: User, req: TestAgent, app: INestApplication, appSvc: AppService;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
		controllers: [FileController, AppController],
	}).compile();

	(app = module.createNestApplication()), (appSvc = module.get(AppService));

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
			.field('name', rawUsr.baseUser.name)
			.field('email', rawUsr.baseUser.email)
			.field('password', rawUsr.password);
		usr = await appSvc.usr.email(rawUsr.baseUser.email);

		headers = e.headers;

		await appSvc.usr.updateRole(usr.baseUser.id, UserRole.admin);
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
					.get(`/file/${usr.baseUser.avatarPath}`)
					.set('Cookie', headers['set-cookie']),
			{
				exps: [
					{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
				],
			},
		);
	});

	it('failed', async () => {
		await execute(() => req.get(`/file/${usr.baseUser.avatarPath}`), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});
});
