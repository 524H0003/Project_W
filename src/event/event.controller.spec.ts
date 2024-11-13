import { MailerService } from '@nestjs-modules/mailer';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';
import { EventController } from './event.controller';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Event } from './event.entity';
import { prepareEmployee } from 'enterprise/employee/employee.controller.spec';
import {
	IEmployeeHook,
	IEmployeeSignup,
} from 'enterprise/employee/employee.model';
import { execute } from 'app/utils/test.utils';

const fileName = curFile(__filename);

let req: TestAgent,
	app: INestApplication,
	appSvc: AppService,
	mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee,
	event: Event;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
		controllers: [EventController],
	}).compile();

	(appSvc = module.get(AppService)),
		(app = module.createNestApplication()),
		(mailerSvc = module.get(MailerService));

	await app.use(cookieParser()).init();
});

export async function prepareEvent(
	req: TestAgent,
	enterprise: Enterprise,
	employee: Employee,
	mailerSvc: MailerService,
) {
	await prepareEmployee(req, enterprise, mailerSvc);

	const { headers } = await req.post('/employee/hook').send({
			enterpriseName: enterprise.baseUser.name,
			...employee,
			...employee.eventCreator.user.baseUser,
		} as IEmployeeHook),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0']['context'][
			'signature'
		];

	await req
		.post('/employee/signup')
		.set('Cookie', headers['set-cookie'])
		.send({
			signature,
			enterpriseName: enterprise.baseUser.name,
			...employee,
			...employee.eventCreator.user,
			...employee.eventCreator.user.baseUser,
		} as IEmployeeSignup);
}

beforeEach(async () => {
	(req = request(app.getHttpServer())),
		(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName)),
		(event = Event.test(fileName));

	await prepareEvent(req, enterprise, employee, mailerSvc);
});

describe('assign', () => {
	it('success', async () => {
		await execute(
			async () => JSON.stringify(await req.post('/event/assign').send(event)),
			{ exps: [{ type: 'toContain', params: ['Success_Assign_Event'] }] },
		);
		await execute(() => appSvc.event.findOne({ title: event.title }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});
