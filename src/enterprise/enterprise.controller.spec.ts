import TestAgent from 'supertest/lib/agent';
import { Enterprise } from './enterprise.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { TestModule } from 'app/module/test.module';
import { EnterpriseController } from './enterprise.controller';
import { HttpStatus, INestApplication } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { execute } from 'app/utils/test.utils';
import { IEnterpriseAssign } from './enterprise.model';
import { AppModule } from 'app/app.module';
import { MailerService } from '@nestjs-modules/mailer';

const fileName = curFile(__filename);

let req: TestAgent,
	enterprise: Enterprise,
	signature: string,
	mailerSvc: MailerService,
	app: INestApplication;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
		controllers: [EnterpriseController],
	}).compile();

	app = module.createNestApplication();

	await app.use(cookieParser()).init(), (mailerSvc = module.get(MailerService));
});

beforeEach(() => {
	(req = request(app.getHttpServer())),
		(enterprise = Enterprise.test(fileName));
});

describe('assign', () => {
	it('success', async () => {
		const { headers } = await req.post('/request-signature').send();

		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/enterprise/assign')
						.set('Cookie', headers['set-cookie'])
						.send({
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
