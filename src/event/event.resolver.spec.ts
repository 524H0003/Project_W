import { MailerService } from '@nestjs-modules/mailer';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'app/app.module';
import { AppService } from 'app/app.service';
import { TestModule } from 'app/module/test.module';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import { Event } from './event.entity';
import { prepareEmployee } from 'enterprise/employee/employee.controller.spec';
import {
	IEmployeeHook,
	IEmployeeSignup,
} from 'enterprise/employee/employee.model';
import { execute, sendGQL, SendGQLType } from 'app/utils/test.utils';
import {
	AssignEvent,
	AssignEventMutation,
	AssignEventMutationVariables,
	UpdateEvent,
	UpdateEventMutation,
	UpdateEventMutationVariables,
} from 'generated/graphql';

const fileName = curFile(__filename);

let req: TestAgent,
	app: INestApplication,
	appSvc: AppService,
	mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee,
	headers: object,
	event: Event;

beforeAll(async () => {
	const module: TestingModule = await Test.createTestingModule({
		imports: [AppModule, TestModule],
	}).compile();

	(appSvc = module.get(AppService)),
		(app = module.createNestApplication()),
		(mailerSvc = module.get(MailerService));

	await app.use(cookieParser()).init();
	req = request(app.getHttpServer());
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

	return await req
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
	(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName)),
		(event = Event.test(fileName));

	headers = (await prepareEvent(req, enterprise, employee, mailerSvc)).headers;
});

describe('assignEvent', () => {
	let send: SendGQLType<AssignEventMutation, AssignEventMutationVariables>;

	beforeAll(() => {
		send = sendGQL(req, AssignEvent);
	});

	it('success', async () => {
		await execute(
			async () =>
				JSON.stringify(await send({ input: event }, headers['set-cookie'])),
			{
				exps: [{ type: 'toContain', params: [event.title] }],
			},
		);
		await execute(() => appSvc.event.find({ title: event.title }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
	});
});

describe('updateEvent', () => {
	let send: SendGQLType<UpdateEventMutation, UpdateEventMutationVariables>,
		sendAssign: SendGQLType<AssignEventMutation, AssignEventMutationVariables>;

	beforeAll(() => {
		send = sendGQL(req, UpdateEvent);
		sendAssign = sendGQL(req, AssignEvent);
	});

	it('success', async () => {
		const newTitle = fileName + (30).string,
			eventId = (await sendAssign({ input: event }, headers['set-cookie']))
				.assignEvent.id;

		await execute(
			async () =>
				JSON.stringify(
					await send(
						{ input: { id: eventId, title: newTitle } },
						headers['set-cookie'],
					),
				),
			{
				exps: [{ type: 'toContain', params: [newTitle] }],
			},
		);
		await execute(() => appSvc.event.find({ title: newTitle }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
		await execute(() => appSvc.event.find({ title: event.title }), {
			exps: [{ type: 'toHaveLength', params: [0] }],
		});
	});

	it('failed due to invalid id', async () => {
		const id = (await sendAssign({ input: event }, headers['set-cookie']))
			.assignEvent.id;

		await execute(
			async () =>
				JSON.stringify(
					await send(
						{ input: { id: id.slice(0, -1) + '0' } },
						headers['set-cookie'],
					),
				),
			{
				exps: [{ type: 'toContain', params: ['Invalid_Event_Id'] }],
			},
		);
	});
});
