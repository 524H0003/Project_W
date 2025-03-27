import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AuthService } from 'auth/auth.service';
import { HookService } from './hook/hook.service';
import { MailService } from './mail/mail.service';
import { StudentService } from 'university/student/student.service';
import { EnterpriseService } from 'enterprise/enterprise.service';
import { EmployeeService } from 'enterprise/employee/employee.service';
import { FacultyService } from 'university/faculty/faculty.service';
import { FileService } from 'file/file.service';
import { EventCreatorService } from 'event/creator/creator.service';
import { UserService } from 'user/user.service';
import { EventService } from 'event/event.service';
import { EventTagService } from 'event/tag/tag.service';
import { NotificationService } from 'notification/notification.service';
import { RecieverService } from 'notification/reciever/reciever.service';
import { EventParticipatorService } from 'event/participator/participator.service';
import { AWSService } from '../file/aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { BlocService } from 'auth/bloc/bloc.service';
import { BaseUserService } from 'user/base/baseUser.service';

/**
 * Server services
 */
@Injectable()
export class AppService {
	constructor(
		@Inject(forwardRef(() => AuthService)) public auth: AuthService,
		@Inject(forwardRef(() => BlocService)) public bloc: BlocService,
		@Inject(forwardRef(() => ConfigService)) public config: ConfigService,
		@Inject(forwardRef(() => HookService)) public hook: HookService,
		@Inject(forwardRef(() => MailService)) public mail: MailService,
		@Inject(forwardRef(() => StudentService)) public student: StudentService,
		@Inject(forwardRef(() => EnterpriseService))
		public enterprise: EnterpriseService,
		@Inject(forwardRef(() => EmployeeService)) public employee: EmployeeService,
		@Inject(forwardRef(() => FacultyService)) public faculty: FacultyService,
		@Inject(forwardRef(() => FileService)) public file: FileService,
		@Inject(forwardRef(() => EventCreatorService))
		public eventCreator: EventCreatorService,
		@Inject(forwardRef(() => UserService)) public user: UserService,
		@Inject(forwardRef(() => BaseUserService)) public baseUser: BaseUserService,
		@Inject(forwardRef(() => EventService)) public event: EventService,
		@Inject(forwardRef(() => EventTagService)) public eventTag: EventTagService,
		@Inject(forwardRef(() => NotificationService))
		public notification: NotificationService,
		@Inject(forwardRef(() => RecieverService)) public recie: RecieverService,
		@Inject(forwardRef(() => EventParticipatorService))
		public eventParticipator: EventParticipatorService,
		@Inject(forwardRef(() => AWSService)) public aws: AWSService,
	) {}
}
