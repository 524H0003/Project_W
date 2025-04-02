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

describe('StudentService', () => {
	it('sign up for student', async () => {
		student = Student.test(fileName);

		await execute(() => svc.student.assign({ ...student.user.baseUser }), {
			exps: [{ type: 'toThrow', params: [err('Success', 'User', 'SignUp')] }],
		});
	});

	it('sign up for stranger', async () => {
		student = Student.test(fileName, { email: 'lmao' });

		await execute(() => svc.student.assign({ ...student.user.baseUser }), {
			exps: [{ type: 'toThrow', params: [err('Invalid', 'Email', '')] }],
		});
	});
});
