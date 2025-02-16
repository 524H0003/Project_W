import { execute, initJest, RequesterType } from 'app/utils/test.utils';
import { Student } from './student.entity';

const fileName = curFile(__filename);

let req: RequesterType, stu: Student;

beforeAll(async () => {
	const { requester } = await initJest();

	req = requester;
});

beforeEach(() => {
	stu = Student.test(fileName);
});

describe('signUp', () => {
	it('fail due to wrong email format', async () => {
		stu = Student.test(fileName, { email: 'aa' });

		await execute(
			async () =>
				(
					await req()
						.post('/student/sign-up')
						.body({ ...stu.user, ...stu.user.baseUser })
						.end()
				).body,
			{ exps: [{ type: 'toContain', params: [err('Invalid', 'Email', '')] }] },
		);
	});

	it('success and request signature from email', async () => {
		await execute(
			async () =>
				(
					await req()
						.post('/student/sign-up')
						.body({ ...stu.user, ...stu.user.baseUser })
						.end()
				).body,
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});
});
