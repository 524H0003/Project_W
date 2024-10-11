import { Test, TestingModule } from '@nestjs/testing';
import { execute } from 'app/utils/test.utils';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { UniversityModule } from 'university/university.module';
import { Student } from './student.entity';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let req: TestAgent, usr: User, app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [TestModule, UniversityModule],
	}).compile();

	app = module.createNestApplication();

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = Student.test(fileName));
});

describe('login', () => {
	it('fail due to wrong email format', async () => {
		usr = Student.test(fileName, { email: 'aa' });

		await execute(() => req.post('/student/login').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});
});
