import { beforeEach, describe, it } from '@jest/globals';
import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { User } from 'user/user.entity';
import { UserRole } from 'user/user.model';
import { File } from './file.entity';

const fileName = curFile(__filename);

let svc: AppService, user: User;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(async () => {
	let rawUsr: User = User.test(fileName);

	user = await svc.user.assign({ ...rawUsr, ...rawUsr.baseUser });

	await svc.user.updateRole(user.id, UserRole.admin);
});

describe('assign', () => {
	it('success', async () => {
		const content = Buffer.from((40).string, 'base64'),
			name = fileName + (5).string + '.png';

		await execute(
			async () =>
				svc.file.assign({ buffer: content, originalname: name }, user.id),
			{
				exps: [{ type: 'toBeInstanceOf', params: [File] }],
			},
		);
	});
});
