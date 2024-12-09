import { MailerService } from '@nestjs-modules/mailer';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Event } from './event.entity';
import { execute, initJest, sendGQL } from 'app/utils/test.utils';

import { prepareEvent } from './event.resolver.spec.utils';
import {
	AssignEvent,
	AssignEventMutation,
	AssignEventMutationVariables,
	UpdateEvent,
	UpdateEventMutation,
	UpdateEventMutationVariables,
} from 'compiled_graphql';
import { AppService } from 'app/app.service';
import TestAgent from 'supertest/lib/agent';

const fileName = curFile(__filename);

let mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee,
	headers: object,
	svc: AppService,
	request: TestAgent,
	event: Event;

beforeAll(async () => {
	const { module, appSvc, req } = await initJest();

	svc = appSvc;
	request = req;
	mailerSvc = module.get(MailerService);
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName)),
		(event = Event.test(fileName));

	headers = (await prepareEvent(request, enterprise, employee, mailerSvc))
		.headers;
});

describe('assignEvent', () => {
	const send = sendGQL<AssignEventMutation, AssignEventMutationVariables>(
		AssignEvent,
	);

	it('success', async () => {
		await execute(
			async () =>
				(await send({ input: event }, headers['set-cookie'])).assignEvent,
			{ exps: [{ type: 'toHaveProperty', params: ['title', event.title] }] },
		);
		await execute(() => svc.event.find({ title: event.title }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
	});
});

describe('updateEvent', () => {
	const send = sendGQL<UpdateEventMutation, UpdateEventMutationVariables>(
		UpdateEvent,
	);
	let eventId: string;

	beforeEach(async () => {
		eventId = (
			await sendGQL<AssignEventMutation, AssignEventMutationVariables>(
				AssignEvent,
			)({ input: event }, headers['set-cookie'])
		).assignEvent.id;
	});

	it('success', async () => {
		const newTitle = fileName + (30).string;

		await execute(
			async () =>
				(
					await send(
						{ input: { id: eventId, title: newTitle } },
						headers['set-cookie'],
					)
				).updateEvent,
			{ exps: [{ type: 'toHaveProperty', params: ['title', newTitle] }] },
		);
		await execute(() => svc.event.find({ title: newTitle }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
		await execute(() => svc.event.find({ title: event.title }), {
			exps: [{ type: 'toHaveLength', params: [0] }],
		});
	});

	it('failed due to invalid id', async () => {
		await execute(
			async () =>
				JSON.stringify(
					await send(
						{ input: { id: eventId.slice(0, -1) + '0' } },
						headers['set-cookie'],
					),
				),
			{ exps: [{ type: 'toContain', params: ['Invalid_Event_Id'] }] },
		);
	});
});
