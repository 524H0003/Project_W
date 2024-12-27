import { MailerService } from '@nestjs-modules/mailer';
import { assignEnterprise } from 'enterprise/enterprise.controller.spec.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import {
	IEmployeeHook,
	IEmployeeSignup,
} from 'enterprise/employee/employee.model';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';

export async function assignEmployee(
	req: TestAgent,
	enterprise: Enterprise,
	employee: Employee,
	mailerSvc: MailerService,
) {
	await assignEnterprise(req, enterprise, mailerSvc);

	const { headers } = await req.post('/employee/hook').send({
			enterpriseName: enterprise.baseUser.name,
			...employee,
			...employee.eventCreator.user.baseUser,
		} as IEmployeeHook),
		signature = (mailerSvc.sendMail as jest.Mock).mock.lastCall['0']['context'][
			'signature'
		];

	return req
		.post('/employee/signup')
		.set('Cookie', headers['set-cookie'])
		.send({
			signature,
			enterpriseName: enterprise.baseUser.name,
			...employee,
			...employee.eventCreator.user,
			...employee.eventCreator.user.baseUser,
		} as IEmployeeSignup);
}
