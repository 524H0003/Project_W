import { Test, TestingModule } from '@nestjs/testing';
import { execute } from 'app/utils/test.utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { Student } from './student.entity';
import { AppModule } from 'app/app.module';

const fileName = curFile(__filename);

let req: TestAgent, stu: Student, app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, AppModule],
	}).compile();

	app = module.createNestApplication();

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (stu = Student.test(fileName));
});

describe('signup', () => {
	it('fail due to wrong email format', async () => {
		stu = Student.test(fileName, { email: 'aa' });

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/student/signup')
						.send({ ...student.user, ...student.user.baseUser }),
				),
			{
				exps: [
					{ type: 'toContain', params: [HttpStatus.BAD_REQUEST.toString()] },
					{ type: 'toContain', params: ['Invalid_Student_Email'] },
				],
			},
		);
	});

	it('success and request signature from email', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/student/signup')
						.send({ ...student.user, ...student.user.baseUser }),
				),
			{
				exps: [
					{ type: 'toContain', params: [HttpStatus.ACCEPTED.toString()] },
					{ type: 'toContain', params: ['Sent_Signature_Email'] },
				],
			},
		);
	});
});
