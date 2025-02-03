import { MailerService } from '@nestjs-modules/mailer';
import { Student } from './student.entity';
import { AppService } from 'app/app.service';
import { LightMyRequestChain } from 'fastify';
import TestAgent from 'supertest/lib/agent';
import { cookie } from 'app/utils/test.utils';

export async function assignStudent(
	req: {
		(testCore: 'fastify'): LightMyRequestChain;
		(testCore: 'supertest'): TestAgent;
		(): LightMyRequestChain;
	},
	svc: AppService,
	studentInp: Student,
	mailerSvc: MailerService,
) {
	const headersInp = (
			await req()
				.post('/student/signup')
				.body({ ...studentInp.user, ...studentInp.user.baseUser })
		).headers,
		token = (
			(mailerSvc.sendMail as jest.Mock).mock.lastCall['0']['context'][
				'url'
			] as string
		)
			.split('/')
			.at(-1),
		password = (30).string + 'Aa!1';

	await req()
		.post(`/change-password/${token}`)
		.headers({ cookie: cookie(headersInp['set-cookie']) })
		.body({ password });

	const { headers } = await req()
			.post('/login')
			.body({ ...studentInp.user.baseUser, password }),
		student = await svc.student.findOne({
			user: { baseUser: { email: studentInp.user.baseUser.email } },
		});

	return { headers, student };
}
