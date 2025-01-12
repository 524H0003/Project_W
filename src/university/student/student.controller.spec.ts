import { execute, initJest } from 'app/utils/test.utils';
import { HttpStatus } from '@nestjs/common';
import TestAgent from 'supertest/lib/agent';
import { Student } from './student.entity';

const fileName = curFile(__filename);

let req: TestAgent, stu: Student;

beforeAll(async () => {
	const { requester } = await initJest();

	req = requester;
});

beforeEach(() => {
	stu = Student.test(fileName);
});

describe('signup', () => {
	it('fail due to wrong email format', async () => {
		stu = Student.test(fileName, { email: 'aa' });

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/student/signup')
						.send({ ...stu.user, ...stu.user.baseUser }),
				),
			{
				exps: [{ type: 'toContain', params: [err('Invalid', 'Email', '')] }],
			},
		);
	});

	it('success and request signature from email', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/student/signup')
						.send({ ...stu.user, ...stu.user.baseUser }),
				),
			{
				exps: [{ type: 'toContain', params: ['Sent_Signature_Email'] }],
			},
		);
	});
});
