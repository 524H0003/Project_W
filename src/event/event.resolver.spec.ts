import { MailerService } from '@nestjs-modules/mailer';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Event } from './event.entity';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import {
	AssignEvent,
	AssignEventMutation,
	AssignEventMutationVariables,
	GetEvents,
	GetEventsQuery,
	GetEventsQueryVariables,
	UpdateEvent,
	UpdateEventMutation,
	UpdateEventMutationVariables,
} from 'build/compiled_graphql';
import { AppService } from 'app/app.service';
import { assignEmployee } from '../enterprise/employee/employee.controller.spec.utils';
import { OutgoingHttpHeaders } from 'http';
import { expect, it } from '@jest/globals';

const fileName = curFile(__filename);

let mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee,
	headers: OutgoingHttpHeaders,
	svc: AppService,
	req: RequesterType,
	event: Event;

beforeAll(async () => {
	const { module, appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName)),
		(event = Event.test(fileName));

	headers = (await assignEmployee(req, svc, enterprise, employee, mailerSvc))
		.headers;
});

describe('getEvents', () => {
	const send = sendGQL<GetEventsQuery, GetEventsQueryVariables>(GetEvents);
	let eventId: string;

	beforeEach(async () => {
		eventId = (
			await sendGQL<AssignEventMutation, AssignEventMutationVariables>(
				AssignEvent,
			)({ input: event }, { headers })
		).assignEvent.id;
	});

	it('success', async () => {
		await execute(
			async () => (await send({ input: {} }, { headers })).getEvents,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({ id: eventId }),
							]),
						],
					},
				],
			},
		);
	});

	it('success with id', async () => {
		await execute(
			async () =>
				(await send({ input: { id: eventId } }, { headers })).getEvents,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({ id: eventId }),
							]),
						],
					},
					{ type: 'toHaveLength', params: [1] },
				],
			},
		);
	});
});

describe('assignEvent', () => {
	const send = sendGQL<AssignEventMutation, AssignEventMutationVariables>(
		AssignEvent,
	);

	it('success', async () => {
		await execute(
			async () => (await send({ input: event }, { headers })).assignEvent,
			{ exps: [{ type: 'toHaveProperty', params: ['title', event.title] }] },
		);
		await execute(() => svc.event.find({ title: event.title, cache: false }), {
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
			)({ input: event }, { headers })
		).assignEvent.id;
	});

	it('success', async () => {
		const newTitle = fileName + (30).string;

		await execute(
			async () =>
				(await send({ input: { id: eventId, title: newTitle } }, { headers }))
					.updateEvent,
			{ exps: [{ type: 'toHaveProperty', params: ['title', newTitle] }] },
		);
		await execute(() => svc.event.find({ title: newTitle, cache: false }), {
			exps: [{ type: 'toHaveLength', params: [1] }],
		});
		await execute(() => svc.event.find({ title: event.title, cache: false }), {
			exps: [{ type: 'toHaveLength', params: [0] }],
		});
	});

	it('failed due to invalid id', async () => {
		const newId =
			eventId.at(-1) !== '0'
				? eventId.slice(0, -1) + '0'
				: eventId.slice(0, -1) + '1';

		await execute(
			async () => await send({ input: { id: newId } }, { headers }),
			{ exps: [{ type: 'toThrow', params: [err('Invalid', 'Event', '')] }] },
		);
	});
});
