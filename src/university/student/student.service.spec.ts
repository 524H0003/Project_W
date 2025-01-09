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
	it('signUp for student', async () => {
		student = Student.test(fileName);

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				svc.student.signUp({
					...student.user.baseUser,
					...student.user,
					...student,
				}),
			{
				throwError: true,
				exps: [{ type: 'toThrow', params: ['Request_New_User'] }],
			},
		);
	});

	it('signUp for stranger', async () => {
		student = Student.test(fileName, { email: 'lmao' });

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				svc.student.signUp({
					...student.user.baseUser,
					...student.user,
					...student,
				}),
			{
				throwError: true,
				exps: [{ type: 'toThrow', params: ['Invalid_Student_Email'] }],
			},
		);
	});
});
