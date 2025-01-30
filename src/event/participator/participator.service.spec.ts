import { AppService } from 'app/app.service';
import { execute, initJest } from 'app/utils/test.utils';
import { Student } from 'university/student/student.entity';
import { assignStudent } from 'university/student/student.controller.spec.utils';
import TestAgent from 'supertest/lib/agent';
import { MailerService } from '@nestjs-modules/mailer';
import { Event } from 'event/event.entity';
import { EventParticipator } from './participator.entity';

const fileName = curFile(__filename);

let svc: AppService,
	student: Student,
	event: Event,
	mailerSvc: MailerService,
	req: TestAgent;

beforeAll(async () => {
	const { appSvc, requester, module } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	const stu = await Student.test(fileName),
		eve = Event.test(fileName);
	event = await svc.event.assign(eve);
	student = (await assignStudent(req, svc, stu, mailerSvc)).student;
});

describe('assign', () => {
	it('success', async () => {
		await execute(
			() => svc.eventParticipator.assign(student.user.id, event.id),
			{
				exps: [{ type: 'toBeInstanceOf', params: [EventParticipator] }],
				onFinish: async (result: EventParticipator) => {
					await execute(
						() => svc.event.findOne({ participators: [{ id: result.id }] }),
						{ exps: [{ type: 'toBeDefined', params: [] }] },
					);
					await execute(
						() => svc.user.findOne({ participatedEvents: [{ id: result.id }] }),
						{ exps: [{ type: 'toBeDefined', params: [] }] },
					);
				},
			},
		);
	});

	it('failed due to not have any position left', async () => {
		const eve = Event.test(fileName);
		eve.positionsAvailable = 0;
		event = await svc.event.assign(eve);

		await execute(
			() => svc.eventParticipator.assign(student.user.id, event.id),
			{
				exps: [
					{ type: 'toThrow', params: [err('Invalid', 'Event', 'Access')] },
				],
			},
		);
	});
});

describe('modify', () => {
	it('success', async () => {
		const interviewNote = (30).string;

		await execute(
			() => svc.eventParticipator.modify(event.id, { interviewNote }),
			{ exps: [{ type: 'toBeInstanceOf', params: [EventParticipator] }] },
		);
		await execute(() => svc.eventParticipator.findOne({ interviewNote }), {
			exps: [{ type: 'toBeDefined', params: [] }],
		});
	});
});
