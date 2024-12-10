import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import TestAgent from 'supertest/lib/agent';
import { EmployeeController } from './employee.controller';
import cookieParser from 'cookie-parser';
import { Employee } from './employee.entity';
import { execute, status } from 'app/utils/test.utils';
import { Enterprise } from 'enterprise/enterprise.entity';
import request from 'supertest';
import { MailerService } from '@nestjs-modules/mailer';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { assignEnterprise } from 'enterprise/enterprise.controller.spec.utils';

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

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	await assignEnterprise(req, enterprise, mailerSvc);
});

describe('hook', () => {
	it('success', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await req.post('/employee/hook').send({
						enterpriseName: enterprise.baseUser.name,
						...employee,
						...employee.eventCreator.user.baseUser,
					} as IEmployeeHook),
				),
			{ exps: [{ type: 'toContain', params: ['Sent_Signature_Email'] }] },
		);
	});
});

describe('signup', () => {
	it('success', async () => {
		const { headers } = await req.post('/employee/hook').send({
				enterpriseName: enterprise.baseUser.name,
				...employee,
				...employee.eventCreator.user.baseUser,
			} as IEmployeeHook),
			signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0'][
				'context'
			]['signature'];

		await execute(
			async () =>
				JSON.stringify(
					await req
						.post('/employee/signup')
						.set('Cookie', headers['set-cookie'])
						.send({
							signature,
							enterpriseName: enterprise.baseUser.name,
							...employee,
							...employee.eventCreator.user,
							...employee.eventCreator.user.baseUser,
						} as IEmployeeSignup),
				),
			{ exps: [{ type: 'toContain', params: [status(HttpStatus.ACCEPTED)] }] },
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
		await execute(
			() =>
				appSvc.enterprise.findOne({
					employees: [
						{
							eventCreator: {
								user: {
									baseUser: { name: employee.eventCreator.user.baseUser.name },
								},
							},
						},
					],
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});
});
