import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Faculty } from './faculty.entity';

const fileName = curFile(__filename);

let svc: AppService, faculty: Faculty;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {});

describe('assign', () => {
	it('success', async () => {
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

	it('failed due to email already taken', async () => {
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

describe('modify', () => {
	it('success', async () => {
		const dbUser = await svc.faculty.assign(
				{
					...faculty.eventCreator.user.baseUser,
					...faculty.eventCreator.user,
					...faculty,
				},
				null,
			),
			name = (20).string,
			newFaculty = {
				eventCreator: { user: { baseUser: { name } } },
				department: name,
			};

		await execute(() => svc.faculty.modify(dbUser.id, newFaculty), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(
					() => svc.employee.find({ ...newFaculty, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
				await execute(() => svc.baseUser.find({ name, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});
