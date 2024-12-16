import { MailerService } from '@nestjs-modules/mailer';
import { AppService } from 'app/app.service';
import { initJest } from 'app/utils/test.utils';
import { Employee } from 'enterprise/employee/employee.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import TestAgent from 'supertest/lib/agent';
import { Notification } from './notification.entity';
import { assignEmployee } from 'enterprise/employee/employee.controller.spec.utils';

const fileName = curFile(__filename);

let req: TestAgent,
	svc: AppService,
	mailerSvc: MailerService,
	employee: Employee,
	notification: Notification,
	headers: object,
	enterprise: Enterprise;

beforeAll(async () => {
	const { module, appSvc, requester } = await initJest();

	(svc = appSvc), (req = requester), (mailerSvc = module.get(MailerService));
});

beforeEach(async () => {
	(employee = Employee.test(fileName)),
		(notification = Notification.test(fileName)),
		(enterprise = Enterprise.test(fileName));

	headers = (await assignEmployee(req, enterprise, employee, mailerSvc))
		.headers;
});
