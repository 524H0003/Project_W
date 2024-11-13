import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import TestAgent from 'supertest/lib/agent';
import { EmployeeController } from './employee.controller';
import cookieParser from 'cookie-parser';
import { Employee } from './employee.entity';
import { execute } from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import request from 'supertest';
import { MailerService } from '@nestjs-modules/mailer';
import { IEnterpriseAssign } from 'enterprise/enterprise.model';
import { IEmployeeHook } from './employee.model';

const fileName = curFile(__filename);

let req: TestAgent,
	app: INestApplication,
	appSvc: AppService,
	mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
		controllers: [EmployeeController],
	}).compile();
	(appSvc = module.get(AppService)),
		(app = module.createNestApplication()),
		(mailerSvc = module.get(MailerService));

	await app.use(cookieParser()).init();
});

export async function prepareEmployee(
	req: TestAgent,
	enterprise: Enterprise,
	mailerSvc: MailerService,
) {
	const { headers } = await req.post('/request-signature').send(),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall[0]['context'][
			'signature'
		];

	await req
		.post('/enterprise/assign')
		.set('Cookie', headers['set-cookie'])
		.send({
			signature,
			...enterprise,
			...enterprise.baseUser,
		} as IEnterpriseAssign);
}

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	await prepareEmployee(req, enterprise, mailerSvc);
});

describe('signup', () => {
	it('success', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req.post('/employee/signup').send({
						enterpriseName: enterprise.baseUser.name,
						...employee,
						...employee.eventCreator.user.baseUser,
					} as IEmployeeHook),
				),
			{
				exps: [
					{ type: 'toContain', params: [HttpStatus.ACCEPTED.toString()] },
					{
						type: 'toContain',
						params: [employee.eventCreator.user.baseUser.name],
					},
				],
			},
		);
		await execute(
			() =>
				appSvc.employee.findOne({
					eventCreator: {
						user: {
							baseUser: { name: employee.eventCreator.user.baseUser.name },
						},
					},
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});
});
