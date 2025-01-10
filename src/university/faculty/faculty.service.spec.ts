import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Faculty } from './faculty.entity';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let svc: AppService, faculty: Faculty;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {});

describe('FacultyService', () => {
	it('assign', async () => {
		let signature: string;

		faculty = Faculty.test(fileName);

		await svc.hook.assign(
			(20).string,
			(s: string) => {
				signature = s;
			},
			'_Email',
		);

		await execute(
			() =>
				svc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
						signature,
					},
					null,
				),
			{ exps: [{ type: 'toBeInstanceOf', params: [User] }] },
		);
	});

	it('assign failed due to email already taken', async () => {
		let signature: string;

		faculty = Faculty.test(fileName);

		await svc.baseUser.assign({ ...faculty.eventCreator.user.baseUser });
		await svc.hook.assign(
			(20).string,
			(s: string) => {
				signature = s;
			},
			'_Email',
		);

		await execute(
			() =>
				svc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
						signature,
					},
					null,
				),
			{ exps: [{ type: 'toThrow', params: ['Invalid_Email'] }] },
		);
	});
});
