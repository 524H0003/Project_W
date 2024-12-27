import { MailerService } from '@nestjs-modules/mailer';
import TestAgent from 'supertest/lib/agent';
import { Student } from './student.entity';
import { AppService } from 'app/app.service';

export async function assignStudent(
	req: TestAgent,
	svc: AppService,
	studentInp: Student,
	mailerSvc: MailerService,
) {
	const headersInp = (
			await req
				.post('/student/signup')
				.send({ ...studentInp.user, ...studentInp.user.baseUser })
		).headers,
		token = (
			(mailerSvc.sendMail as jest.Mock).mock.lastCall['0']['context'][
				'url'
			] as String
		)
			.split('/')
			.at(-1),
		password = (30).string + 'Aa!1';

	await req
		.post(`/change-password/${token}`)
		.set('Cookie', headersInp['set-cookie'])
		.send({ password });

	const { headers } = await req
			.post('/login')
			.send({ ...studentInp.user.baseUser, password }),
		student = await svc.student.findOne({
			user: { baseUser: { email: studentInp.user.baseUser.email } },
		});

	return { headers, student };
}
