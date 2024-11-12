import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { Student } from './student.entity';
import { execute } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let appSvc: AppService, student: Student;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	appSvc = module.get(AppService);
});

beforeEach(() => {});

describe('StudentService', () => {
	it('signUp for student', async () => {
		student = Student.test(fileName);

		await execute(
			// eslint-disable-next-line @typescript-eslint/require-await
			async () => () =>
				appSvc.student.signUp({
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
				appSvc.student.signUp({
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
