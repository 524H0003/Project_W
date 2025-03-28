import { MailerService } from '@nestjs-modules/mailer';
import { Student } from './student.entity';
import { AppService } from 'app/app.service';
import { getCookie, RequesterType } from 'app/utils/test.utils';

export async function assignStudent(
	req: RequesterType,
	svc: AppService,
	studentInp: Student,
	mailerSvc: MailerService,
) {
	const headersInp = (
			await req()
				.post('/student/sign-up')
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
		.headers({ cookie: getCookie(headersInp['set-cookie']) })
		.body({ password });

	const { headers } = await req()
			.post('/login')
			.body({ ...studentInp.user.baseUser, password }),
		student = await svc.student.findOne({
			user: { baseUser: { email: studentInp.user.baseUser.email } },
			cache: false,
		});

	return { headers, student };
}
