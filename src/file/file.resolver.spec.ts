import { AppService } from 'app/app.service';
import { execute, initJest, sendGQL } from 'app/utils/test.utils';
import {
	UploadFile,
	UploadFileMutation,
	UploadFileMutationVariables,
} from 'build/compiled_graphql';
import TestAgent from 'supertest/lib/agent';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';

const fileName = curFile(__filename);

let req: TestAgent, svc: AppService, headers: object;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(req = requester), (svc = appSvc);
});

beforeEach(async () => {
	let rawUsr: User = User.test(fileName),
		usr: User;

	const e = await req.post('/signup').send({ ...rawUsr, ...rawUsr.baseUser });
	usr = await svc.user.email(rawUsr.baseUser.email);

	headers = e.headers;

	await svc.user.updateRole(usr.id, UserRole.admin);
});

describe('uploadFile', () => {
	const send = sendGQL<UploadFileMutation, UploadFileMutationVariables>(
		UploadFile,
	);

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ file: null },
						{
							cookie: headers['set-cookie'],
							map: { file: ['variables.file'] },
							attach: [
								'file',
								Buffer.from((40).string, 'base64'),
								fileName + (5).string + '.png',
							],
						},
					)
				).uploadFile,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
			},
		);
	});
});
