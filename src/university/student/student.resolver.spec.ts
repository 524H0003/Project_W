import { beforeAll, beforeEach, describe, expect } from '@jest/globals';
import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import {
	execute,
	initJest,
	RequesterType,
	sendGQL,
} from 'app/utils/test.utils';
import { OutgoingHttpHeaders } from 'http';
import { Student } from './student.entity';
import { assignStudent } from './student.controller.spec.utils';
import {
	GetStudents,
	GetStudentsQuery,
	GetStudentsQueryVariables,
} from 'build/compiled_graphql';

const fileName = curFile(__filename);

let req: RequesterType,
	svc: AppService,
	mailerSvc: MailerService,
	student: Student,
	headers: OutgoingHttpHeaders;

beforeAll(async () => {
	const { requester, appSvc, module } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	const res = await assignStudent(req, svc, Student.test(fileName), mailerSvc);

	(student = res.student), (headers = res.headers);
});

describe('getStudent', () => {
	const send = sendGQL<GetStudentsQuery, GetStudentsQueryVariables>(
		GetStudents,
	);

	it('success with id', async () => {
		await execute(
			async () =>
				(await send({ input: { id: student.id } }, { headers })).getStudents,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({
									...student.info.student,
									user: { ...student.user.info, lastLogin: expect.anything() },
								}),
							]),
						],
					},
				],
			},
		);
	});

	it('success with name', async () => {
		await execute(
			async () =>
				(await send({ input: { name: student.user.info.name } }, { headers }))
					.getStudents,
			{
				exps: [
					{
						type: 'toEqual',
						params: [
							expect.arrayContaining([
								expect.objectContaining({
									...student.info.student,
									user: { ...student.user.info, lastLogin: expect.anything() },
								}),
							]),
						],
					},
				],
			},
		);
	});
});
