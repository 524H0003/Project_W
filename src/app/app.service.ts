import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from './utils/typeorm.utils';
import { BaseUser } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { AuthService, SignService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
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
import { AWSService } from './aws/aws.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
	public baseUser: BaseUserService;

	constructor(
		@InjectRepository(BaseUser) baseUserRepo: Repository<BaseUser>,
		@Inject(forwardRef(() => AuthService))
		public auth: AuthService,
		@Inject(forwardRef(() => DeviceService))
		public device: DeviceService,
		@Inject(forwardRef(() => SessionService))
		public session: SessionService,
		@Inject(forwardRef(() => HookService))
		public hook: HookService,
		@Inject(forwardRef(() => MailService))
		public mail: MailService,
		@Inject(forwardRef(() => StudentService))
		public student: StudentService,
		@Inject(forwardRef(() => EnterpriseService))
		public enterprise: EnterpriseService,
		@Inject(forwardRef(() => EmployeeService))
		public employee: EmployeeService,
		@Inject(forwardRef(() => FacultyService))
		public faculty: FacultyService,
		@Inject(forwardRef(() => FileService))
		public file: FileService,
		@Inject(forwardRef(() => EventCreatorService))
		public eventcreator: EventCreatorService,
		@Inject(forwardRef(() => UserService))
		public user: UserService,
		@Inject(forwardRef(() => SignService))
		public sign: SignService,
		@Inject(forwardRef(() => EventService))
		public event: EventService,
		@Inject(forwardRef(() => EventTagService))
		public eventTag: EventTagService,
		@Inject(forwardRef(() => NotificationService))
		public noti: NotificationService,
		@Inject(forwardRef(() => RecieverService))
		public recie: RecieverService,
		@Inject(forwardRef(() => EventParticipatorService))
		public eventParti: EventParticipatorService,
		@Inject(forwardRef(() => AWSService))
		public aws: AWSService,
		public cfg: ConfigService,
	) {
		this.baseUser = new BaseUserService(baseUserRepo);
	}
}

/**
 * Base user service
 */
class BaseUserService extends DatabaseRequests<BaseUser> {
	constructor(repo: Repository<BaseUser>) {
		super(repo);
	}

	/**
	 * Assign new base user
	 * @param {DeepPartial<BaseUser>} entity - assigning user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<BaseUser>}
	 */
	async assign(
		entity: DeepPartial<BaseUser>,
		options?: SaveOptions,
	): Promise<BaseUser> {
		return new BaseUser(
			await super.save({ ...entity, email: entity.email.lower }, options),
		);
	}

	/**
	 * Modify new base user
	 * @param {string} entityId - base user's id
	 * @param {DeepPartial<BaseUser>} updatedEntity - modified base user
	 * @return {Promise<BaseUser>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<BaseUser>,
	): Promise<BaseUser> {
		if (updatedEntity) {
			if (updatedEntity.email) updatedEntity.email = updatedEntity.email.lower;
			await super.update({ id: entityId }, updatedEntity);
		}
		return new BaseUser(await this.id(entityId));
	}

	/**
	 * Remove base user
	 * @param {string} entityId - base user's id
	 */
	async remove(entityId: string) {
		await this.delete({ id: entityId });
	}

	/**
	 * Find by email
	 * @param {string} input - the email address
	 * @return {Promise<BaseUser>}
	 */
	email(input: string): Promise<BaseUser> {
		return this.findOne({ email: input.lower });
	}
}
