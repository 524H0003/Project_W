import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests, ExtendOptions } from './utils/typeorm.utils';
import { BaseUser } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
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
import { AWSService } from './aws/aws.service';
import { ConfigService } from '@nestjs/config';
import { BlocService } from 'auth/bloc/bloc.service';

/**
 * Server services
 */
@Injectable()
export class AppService {
	public baseUser: BaseUserService;

	constructor(
		@InjectRepository(BaseUser) baseUserRepo: Repository<BaseUser>,
		@Inject(forwardRef(() => AuthService)) public auth: AuthService,
		@Inject(forwardRef(() => BlocService)) public bloc: BlocService,
		@Inject(forwardRef(() => ConfigService)) public cfg: ConfigService,
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
		@Inject(forwardRef(() => EventService)) public event: EventService,
		@Inject(forwardRef(() => EventTagService)) public eventTag: EventTagService,
		@Inject(forwardRef(() => NotificationService))
		public notification: NotificationService,
		@Inject(forwardRef(() => RecieverService)) public recie: RecieverService,
		@Inject(forwardRef(() => EventParticipatorService))
		public eventParticipator: EventParticipatorService,
		@Inject(forwardRef(() => AWSService)) public aws: AWSService,
	) {
		this.baseUser = new BaseUserService(baseUserRepo);
	}
}

/**
 * Base user service
 */
class BaseUserService extends DatabaseRequests<BaseUser> {
	/**
	 * Initiate base user service
	 */
	constructor(repo: Repository<BaseUser>) {
		super(repo, BaseUser);
	}

	/**
	 * Assign new base user
	 * @param {DeepPartial<BaseUser>} entity - assigning user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<BaseUser>}
	 */
	async assign(
		entity: DeepPartial<BaseUser>,
		options?: SaveOptions & ExtendOptions,
	): Promise<BaseUser> {
		return new BaseUser(
			await this.save({ ...entity, email: entity.email.lower }, options),
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
		return this.id(entityId);
	}

	/**
	 * Find by email
	 * @param {string} input - the email address
	 * @return {Promise<BaseUser>}
	 */
	email(input: string): Promise<BaseUser> {
		return this.findOne({ email: input.lower });
	}

	/**
	 * Remove base user by id
	 */
	remove(id: string) {
		return this.delete({ id });
	}
}
