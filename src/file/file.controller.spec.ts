import {
	createFile,
	execute,
	getCookie,
	initJest,
	RequesterType,
} from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';
import { readFileSync } from 'fs';
import { rootPublic } from 'app/module/test.module';
import { it } from '@jest/globals';
import formAutoContent from 'form-auto-content';
import { OutgoingHttpHeaders } from 'http';

const fileName = curFile(__filename);
let rawUsr: User, req: RequesterType, svc: AppService;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester);
});

beforeEach(() => {
	rawUsr = User.test(fileName);
});

describe('seeUploadedFile', () => {
	let headers: OutgoingHttpHeaders, usr: User;

	beforeEach(async () => {
		const e = await req({
			method: 'post',
			url: '/sign-up',
			...formAutoContent({
				name: rawUsr.baseUser.name,
				email: rawUsr.baseUser.email,
				password: rawUsr.password,
				avatar: createFile(
					(6).string + '.png',
					Buffer.from((40).string, 'base64'),
				),
			}),
		});
		usr = await svc.user.email(rawUsr.baseUser.email);

		headers = e.headers;

		await svc.user.updateRole(usr.id, UserRole.admin);
	});

	it('success on server files', async () => {
		const serverFile = 'defaultUser.server.jpg';

		await execute(
			async () =>
				(
					await req({
						method: 'get',
						url: '/file/' + serverFile,
					})
				).body,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							readFileSync(rootPublic + serverFile, { encoding: 'utf8' }),
						],
					},
				],
			},
		);
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await req({
						method: 'get',
						url: `/file/${usr.baseUser.avatarPath}`,
						headers: {
							cookie: getCookie(headers['set-cookie']),
						},
					})
				).body,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							readFileSync(rootPublic + usr.baseUser.avatarPath, {
								encoding: 'utf8',
							}),
						],
					},
				],
			},
		);
	});
});
