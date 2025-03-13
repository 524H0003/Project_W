import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import {
	AssignParticipator,
	AssignParticipatorMutation,
	AssignParticipatorMutationVariables,
	UpdateParticipator,
	UpdateParticipatorMutation,
	UpdateParticipatorMutationVariables,
} from 'build/compiled_graphql';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { Event } from 'event/event.entity';
import { OutgoingHttpHeaders } from 'http';
import { assignStudent } from 'university/student/student.controller.spec.utils';
import { Student } from 'university/student/student.entity';

const fileName = curFile(__filename);

let req: RequesterType,
	svc: AppService,
	mailerSvc: MailerService,
	student: Student,
	event: Event,
	empHeaders: OutgoingHttpHeaders,
	stuHeaders: OutgoingHttpHeaders;

beforeAll(async () => {
	const { requester, appSvc, module } = await initJest();

	(req = requester), (svc = appSvc), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	const emp = await assignEmployee(
			req,
			svc,
			Enterprise.test(fileName),
			Employee.test(fileName),
			mailerSvc,
		),
		eve = Event.test(fileName, emp.employee.eventCreator),
		stu = await assignStudent(req, svc, Student.test(fileName), mailerSvc);

	(student = stu.student),
		(stuHeaders = stu.headers),
		(event = await svc.event.assign({
			...eve,
			eventCreatedBy: emp.employee.eventCreator,
		})),
		(empHeaders = emp.headers);
});

describe('assignParticipator', () => {
	const send = sendGQL<
		AssignParticipatorMutation,
		AssignParticipatorMutationVariables
	>(AssignParticipator);

	it('success', async () => {
		await execute(
			async () =>
				(
					await send(
						{ input: { userId: student.user.id, eventId: event.id } },
						{ headers: stuHeaders },
					)
				).assignParticipator,
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
		await execute(
			() =>
				svc.eventParticipator.findOne({
					participatedBy: { baseUser: { id: student.user.id } },
				}),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);
	});
});

describe('updateParticipator', () => {
	const send = sendGQL<
		UpdateParticipatorMutation,
		UpdateParticipatorMutationVariables
	>(UpdateParticipator);

	let participatorId: string;

	beforeEach(async () => {
		participatorId = (
			await sendGQL<
				AssignParticipatorMutation,
				AssignParticipatorMutationVariables
			>(AssignParticipator)(
				{ input: { userId: student.user.id, eventId: event.id } },
				{ headers: stuHeaders },
			)
		).assignParticipator.id;
	});

	it('success', async () => {
		const interviewNote = (30).string;

		await execute(
			() =>
				send(
					{ input: { id: participatorId, interviewNote } },
					{ headers: empHeaders },
				),
			{ exps: [{ type: 'toBeDefined', params: [] }] },
		);

		await execute(() => svc.eventParticipator.findOne({ interviewNote }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});

	it('failed due to invalid id', async () => {
		const interviewNote = (30).string,
			newId =
				participatorId.at(-1) !== '0'
					? participatorId.slice(0, -1) + '0'
					: participatorId.slice(0, -1) + '1';

		await execute(
			() =>
				send({ input: { id: newId, interviewNote } }, { headers: empHeaders }),
			{ exps: [{ type: 'toThrow', params: [err('Invalid', 'User', '')] }] },
		);
	});
});
