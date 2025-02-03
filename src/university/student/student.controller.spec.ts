import { execute, initJest } from 'app/utils/test.utils';
import { LightMyRequestChain } from 'fastify';
import { Student } from './student.entity';

const fileName = curFile(__filename);

let req: () => LightMyRequestChain, stu: Student;

beforeAll(async () => {
	const { requester } = await initJest();

	req = requester;
});

beforeEach(async () => {
	stu = await Student.test(fileName);
});

describe('signup', () => {
	it('fail due to wrong email format', async () => {
		stu = await Student.test(fileName, { email: 'aa' });

		await execute(
			async () =>
				JSON.stringify(
					await req()
						.post('/student/signup')
						.body({ ...stu.user, ...stu.user.baseUser }),
				),
			{ exps: [{ type: 'toContain', params: [err('Invalid', 'Email', '')] }] },
		);
	});

	it('success and request signature from email', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req()
						.post('/student/signup')
						.body({ ...stu.user, ...stu.user.baseUser }),
				),
			{
				exps: [
					{ type: 'toContain', params: [err('Success', 'Signature', 'Sent')] },
				],
			},
		);
	});
});
