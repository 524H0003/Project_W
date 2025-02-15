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
		faculty = Faculty.test(fileName);

		await execute(
			() =>
				svc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
					},
					null,
				),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});

	it('assign failed due to email already taken', async () => {
		faculty = Faculty.test(fileName);

		await svc.baseUser.assign({ ...faculty.eventCreator.user.baseUser });

		await execute(
			() =>
				svc.faculty.assign(
					{
						...faculty.eventCreator.user.baseUser,
						...faculty.eventCreator.user,
						...faculty,
					},
					null,
				),
			{ exps: [{ type: 'toThrow', params: ['Invalid_Email'] }] },
		);
	});
});
