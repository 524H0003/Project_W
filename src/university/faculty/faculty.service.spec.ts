import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Faculty } from './faculty.entity';

const fileName = curFile(__filename);

let svc: AppService, faculty: Faculty;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {
	faculty = Faculty.test(fileName);
});

describe('assign', () => {
	it('success', async () => {
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
		const { id } = await svc.faculty.assign(
				{
					...faculty.eventCreator.user.baseUser,
					...faculty.eventCreator.user,
					...faculty,
				},
				null,
			),
			name = (40).string,
			newFaculty = {
				eventCreator: { user: { baseUser: { name } } },
				department: (100).string,
			};

		await execute(() => svc.faculty.modify(id, newFaculty), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(
					() => svc.faculty.find({ ...newFaculty, id, cache: false }),
					{ exps: [{ type: 'toHaveLength', params: [1] }] },
				);
				await execute(() => svc.baseUser.find({ name, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});
