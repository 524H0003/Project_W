import { HttpStatus, INestApplication } from '@nestjs/common';
import { execute, initJest } from 'app/utils/test.utils';
import { FileController } from 'file/file.controller';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';

const fileName = curFile(__filename);
let rawUsr: User, req: TestAgent, app: INestApplication, svc: AppService;

beforeAll(async () => {
	const { appSvc } = await initJest([FileController]);

	svc = appSvc;
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
		usr = await svc.user.email(rawUsr.baseUser.email);

		headers = e.headers;

		await svc.user.updateRole(usr.id, UserRole.admin);
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
});
