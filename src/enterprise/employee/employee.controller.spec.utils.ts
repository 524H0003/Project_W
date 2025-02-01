import { MailerService } from '@nestjs-modules/mailer';
import { assignEnterprise } from 'enterprise/enterprise.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import {
	IEmployeeHook,
	IEmployeeSignup,
} from 'enterprise/employee/employee.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';
import { AppService } from 'app/app.service';

export async function assignEmployee(
	req: () => TestAgent,
	svc: AppService,
	enterprise: Enterprise,
	empInp: Employee,
	mailerSvc: MailerService,
) {
	await assignEnterprise(
		req,
		enterprise,
		mailerSvc,
		svc.cfg.get('ADMIN_EMAIL'),
	);

	const empHeaders = (
			await req()
				.post('/employee/hook')
				.send({
					enterpriseName: enterprise.baseUser.name,
					...empInp,
					...empInp.eventCreator.user.baseUser,
				} as IEmployeeHook)
		).headers,
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0']['context'][
			'signature'
		],
		{ headers } = await req()
			.post('/employee/signup')
			.set('Cookie', empHeaders['set-cookie'])
			.send({
				signature,
				enterpriseName: enterprise.baseUser.name,
				...empInp,
				...empInp.eventCreator.user,
				...empInp.eventCreator.user.baseUser,
			} as IEmployeeSignup),
		employee = await svc.employee.findOne({
			eventCreator: {
				user: {
					baseUser: {
						email: empInp.eventCreator.user.baseUser.email.toLowerCase(),
					},
				},
			},
		});

	return { headers, employee };
}
