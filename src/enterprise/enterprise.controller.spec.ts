import TestAgent from 'supertest/lib/agent';
import { Enterprise } from './enterprise.entity';
import { AppService } from 'app/app.service';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'app/module/test.module';
import { EnterpriseController } from './enterprise.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { execute } from 'app/utils/test.utils';
import { IEnterpriseAssign } from './enterprise.model';

const fileName = curFile(__filename);

let req: TestAgent,
	enterprise: Enterprise,
	appSvc: AppService,
	signature: string,
	app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [, TestModule],
		controllers: [EnterpriseController],
	}).compile();

	(appSvc = module.get(AppService)), (app = module.createNestApplication());

	await app.use(cookieParser()).init();
});

beforeEach(() => {
	(req = request(app.getHttpServer())),
		(enterprise = Enterprise.test(fileName));
});

describe('EnterpriseController', () => {
	describe('assign', () => {
		it('success', async () => {
			await appSvc.hook.assign(
				'',
				(s: string) => {
					signature = s;
				},
				'_Email',
			);

			await execute(
				async () =>
					JSON.stringify(
						await req.post('/enterprise/assign').send({
							signature,
							...enterprise,
							...enterprise.baseUser,
						} as IEnterpriseAssign),
					),
				{
					exps: [
						{ type: 'toContain', params: [HttpStatus.ACCEPTED.toString()] },
						{ type: 'toContain', params: ['Success_Assign_Enterprise'] },
					],
				},
			);
		});
	});
});
