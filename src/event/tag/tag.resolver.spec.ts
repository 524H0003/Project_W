import { AppService } from 'app/app.service';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import { EventTag } from './tag.entity';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { MailerService } from '@nestjs-modules/mailer';
import {
	AssignEvent,
	AssignEventMutation,
	AssignEventMutationVariables,
	AssignEventTag,
	AssignEventTagMutation,
	AssignEventTagMutationVariables,
	AttachEventTag,
	AttachEventTagMutation,
	AttachEventTagMutationVariables,
	ListAllTags,
	ListAllTagsQuery,
	ListAllTagsQueryVariables,
} from 'build/compiled_graphql';
import { Event } from 'event/event.entity';
import { OutgoingHttpHeaders } from 'http';

const fileName = curFile(__filename);

let mailerSvc: MailerService,
	enterprise: Enterprise,
	employee: Employee,
	svc: AppService,
	req: RequesterType,
	headers: OutgoingHttpHeaders,
	tag: EventTag;

beforeAll(async () => {
	const { module, appSvc, requester } = await initJest();

	(req = requester), (svc = appSvc), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(enterprise = Enterprise.test(fileName)),
		(tag = EventTag.test(fileName));

	headers = (await assignEmployee(req, svc, enterprise, employee, mailerSvc))
		.headers;
});

describe('assignEventTag', () => {
	const send = sendGQL<AssignEventTagMutation, AssignEventTagMutationVariables>(
		AssignEventTag,
	);

	it('success', async () => {
		await execute(
			async () =>
				(await send({ input: tag }, { headers: headers })).assignEventTag,
			{
				exps: [{ type: 'toHaveProperty', params: ['name', tag.name] }],
				onFinish: async (result) => {
					await execute(() => svc.eventTag.id(result.id), {
						exps: [{ type: 'toHaveProperty', params: ['name', tag.name] }],
					});
				},
			},
		);
	});

	it('success when already assigned', async () => {
		await send({ input: tag }, { headers: headers });

		await execute(
			async () =>
				(await send({ input: tag }, { headers: headers })).assignEventTag,
			{
				exps: [{ type: 'toHaveProperty', params: ['name', tag.name] }],
				onFinish: async (result) => {
					await execute(() => svc.eventTag.id(result.id), {
						exps: [{ type: 'toHaveProperty', params: ['name', tag.name] }],
					});
				},
			},
		);
	});
});

describe('attachEventTag', () => {
	const send = sendGQL<AttachEventTagMutation, AttachEventTagMutationVariables>(
		AttachEventTag,
	);
	let eventId: string;

	beforeEach(async () => {
		eventId = (
			await sendGQL<AssignEventMutation, AssignEventMutationVariables>(
				AssignEvent,
			)({ input: Event.test(fileName) }, { headers: headers })
		).assignEvent.id;
	});

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { eventId, name: tag.name } },
						{ headers: headers },
					)
				).attachEventTag.toEvents[0],
			{ exps: [{ type: 'toHaveProperty', params: ['id', eventId] }] },
		);
	});
});

describe('listAllTags', () => {
	const send = sendGQL<ListAllTagsQuery, ListAllTagsQueryVariables>(
		ListAllTags,
	);
	let tagId: string;

	beforeEach(async () => {
		tagId = (
			await sendGQL<AssignEventTagMutation, AssignEventTagMutationVariables>(
				AssignEventTag,
			)({ input: EventTag.test(fileName) }, { headers: headers })
		).assignEventTag.id;
	});

	it('success', async () => {
		await execute(
			async () => (await send({ input: {} }, { headers: headers })).listAllTags,
			{
				exps: [{ type: 'toBeDefined', params: [] }],
				onFinish: async (result) => {
					await execute(() => result.some((i) => i.id === tagId), {
						exps: [{ type: 'toEqual', params: [true] }],
					});
				},
			},
		);
	});
});
