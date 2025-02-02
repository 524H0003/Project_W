import { execute, initJest } from 'app/utils/test.utils';
import { FileController } from 'file/file.controller';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';
import { readFileSync } from 'fs';
import { rootPublic } from 'app/module/test.module';

const fileName = curFile(__filename);
let rawUsr: User, req: () => TestAgent, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

beforeEach(() => {
	rawUsr = User.test(fileName);
});

describe('seeUploadedFile', () => {
	let headers: object, usr: User;

	beforeEach(async () => {
		const e = await req()
			.post('/signup')
			.attach('avatar', Buffer.from((40).string, 'base64'), 'avatar.png')
			.field('name', rawUsr.baseUser.name)
			.field('email', rawUsr.baseUser.email)
			.field('password', rawUsr.password);
		usr = await svc.user.email(rawUsr.baseUser.email);

		headers = e.headers;

		await svc.user.updateRole(usr.id, UserRole.admin);
	});

	it('success on server files', async () => {
		const serverFile = 'defaultUser.server.jpg';

		await execute(
			() =>
				req()
					.get('/file/' + serverFile)
					.buffer()
					.parse((res, callback) => {
						res.text = '';
						res
							.setEncoding('base64')
							.on('data', (chunk) => (res.text += chunk))
							.on('end', () => callback(null, Buffer.from(res.text, 'base64')));
					}),
			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'text',
							readFileSync(rootPublic + serverFile, { encoding: 'base64' }),
						],
					},
				],
			},
		);
	});

	it('success', async () => {
		await execute(
			() =>
				req()
					.get(`/file/${usr.baseUser.avatarPath}`)
					.set('Cookie', headers['set-cookie'])
					.buffer()
					.parse((res, callback) => {
						res.text = '';
						res
							.setEncoding('base64')
							.on('data', (chunk) => (res.text += chunk))
							.on('end', () => callback(null, Buffer.from(res.text, 'base64')));
					}),

			{
				exps: [
					{
						type: 'toHaveProperty',
						params: [
							'text',
							readFileSync(rootPublic + usr.baseUser.avatarPath, {
								encoding: 'base64',
							}),
						],
					},
				],
			},
		);
	});
});
