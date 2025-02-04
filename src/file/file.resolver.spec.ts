import { AppService } from 'app/app.service';
import {
	createFile,
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import {
	UploadFile,
	UploadFileMutation,
	UploadFileMutationVariables,
} from 'build/compiled_graphql';
import { OutgoingHttpHeaders } from 'http';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';

const fileName = curFile(__filename);

let req: RequesterType, svc: AppService, headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { appSvc, requester } = await initJest();

	(req = requester), (svc = appSvc);
});

beforeEach(async () => {
	let rawUsr: User = User.test(fileName),
		usr: User;

	const e = await req()
		.post('/signup')
		.body({ ...rawUsr, ...rawUsr.baseUser });
	usr = await svc.user.email(rawUsr.baseUser.email);

	headers = e.headers;

	await svc.user.updateRole(usr.id, UserRole.admin);
});

describe('uploadFile', () => {
	const send = sendGQL<UploadFileMutation, UploadFileMutationVariables>(
		UploadFile,
	);

	it('success', async () => {
		const content = Buffer.from((40).string, 'base64'),
			name = fileName + (5).string + '.png';

		await execute(
			async () =>
				(
					await send(
						{ file: null },
						{
							headers: headers,
							map: { file: ['variables.file'] },
							files: {
								file: createFile(name, content),
							},
						},
					)
				).uploadFile,
			{ exps: [{ type: 'toHaveProperty', params: ['title', name] }] },
		);
	});
});
