import { AppService } from 'app/app.service';
import { Student } from './student.entity';
import { execute, initJest } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let svc: AppService, student: Student;

beforeAll(async () => {
	const { appSvc } = await initJest();

	svc = appSvc;
});

beforeEach(() => {});

describe('assign', () => {
	it('success', async () => {
		student = Student.test(fileName);

		await execute(() => svc.student.assign({ ...student.user.baseUser }), {
			exps: [{ type: 'toBeInstanceOf', params: [Student] }],
		});
	});

	it('failed due to invalid email', async () => {
		student = Student.test(fileName, { email: 'lmao' });

		await execute(() => svc.student.assign({ ...student.user.baseUser }), {
			exps: [{ type: 'toThrow', params: [err('Invalid', 'Email', '')] }],
		});
	});
});

describe('modify', () => {
	beforeEach(() => {
		student = Student.test(fileName);
	});

	it('success', async () => {
		const dbUser = await svc.student.assign({ ...student.user.baseUser }),
			name = (20).string,
			newStudent = {
				user: { baseUser: { name } },
				enrollmentYear: (2000).random,
			};

		await execute(() => svc.student.modify(dbUser.id, newStudent), {
			exps: [{ type: 'toThrow', not: true, params: [] }],
			onFinish: async () => {
				await execute(() => svc.student.find({ ...newStudent, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
				await execute(() => svc.baseUser.find({ name, cache: false }), {
					exps: [{ type: 'toHaveLength', params: [1] }],
				});
			},
		});
	});
});
