import { Test, TestingModule } from '@nestjs/testing';
import { execute } from 'app/utils/test.utils';
import { Repository } from 'typeorm';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TestModule } from 'app/module/test.module';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';
import { UniversityModule } from 'university/university.module';
import { Device } from 'auth/device/device.entity';
import { Student } from './student.entity';
import { User } from 'user/user.entity';

const fileName = curFile(__filename);

let dvcRepo: Repository<Device>,
	req: TestAgent,
	usr: User,
	app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [UniversityModule, TestModule],
	}).compile();

	(dvcRepo = module.get(getRepositoryToken(Device))),
		(app = module.createNestApplication());

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())), (usr = Student.test(fileName));
});

describe('login', () => {
	it('success', async () => {
		await execute(() => req.post('/student/login').send(usr), {
			exps: [
				{
					type: 'toHaveProperty',
					params: [
						'headers.set-cookie',
						expect.arrayContaining([expect.anything(), expect.anything()]),
					],
				},
				{ type: 'toHaveProperty', params: ['status', HttpStatus.ACCEPTED] },
			],
		});

		await execute(
			() => dvcRepo.find({ where: { owner: { email: usr.email } } }),
			{ exps: [{ type: 'toHaveLength', params: [1] }] },
		);
	});

	it('fail due to wrong email format', async () => {
		usr = Student.test(fileName, { email: 'aa' });

		await execute(() => req.post('/student/login').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});

	it('fail due to wrong password', async () => {
		usr = Student.test(fileName, { password: (30).string });

		await execute(() => req.post('/student/login').send(usr), {
			exps: [
				{ type: 'toHaveProperty', params: ['status', HttpStatus.BAD_REQUEST] },
			],
		});
	});
});
