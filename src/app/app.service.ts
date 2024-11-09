import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests, FindOptionsWithCustom } from './utils/typeorm.utils';
import { BaseUser } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository, SaveOptions } from 'typeorm';
import { AuthService, SignService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from './hook/hook.service';
import { MailService } from './mail/mail.service';
import { StudentService } from 'university/student/student.service';
import { EnterpriseService } from 'enterprise/enterprise.service';
import { EmployeeService } from 'enterprise/employee/employee.service';
import { FacultyService } from 'university/faculty/faculty.service';
import { FileService } from 'file/file.service';
import { EventCreatorService } from 'event/creator/creator.service';
import { UserService } from 'user/user.service';

/**
 * @ignore
 */
@Injectable()
export class AppService {
	public baseUser: BaseUserService;

	constructor(
		@InjectRepository(BaseUser) baseUserRepo: Repository<BaseUser>,
		@Inject(forwardRef(() => AuthService))
		public auth: AuthService,
		@Inject(forwardRef(() => DeviceService))
		public dvc: DeviceService,
		@Inject(forwardRef(() => SessionService))
		public sess: SessionService,
		@Inject(forwardRef(() => ConfigService))
		public cfg: ConfigService,
		@Inject(forwardRef(() => HookService))
		public hook: HookService,
		@Inject(forwardRef(() => MailService))
		public mail: MailService,
		@Inject(forwardRef(() => StudentService))
		public stu: StudentService,
		@Inject(forwardRef(() => EnterpriseService))
		public ent: EnterpriseService,
		@Inject(forwardRef(() => EmployeeService))
		public emp: EmployeeService,
		@Inject(forwardRef(() => FacultyService))
		public fac: FacultyService,
		@Inject(forwardRef(() => FileService))
		public file: FileService,
		@Inject(forwardRef(() => EventCreatorService))
		public envCre: EventCreatorService,
		@Inject(forwardRef(() => UserService))
		public usr: UserService,
		@Inject(forwardRef(() => SignService))
		public sign: SignService,
	) {
		this.baseUser = new BaseUserService(baseUserRepo);
	}
}

/**
 * Base user service
 */
class BaseUserService extends DatabaseRequests<BaseUser> {
	/**
	 * @ignore
	 */
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
	 * @param {DeepPartial<BaseUser>} entity - user
	 * @param {DeepPartial<BaseUser>} updatedEntity - modified user
	 * @return {Promise<BaseUser>}
	 */
	async modify(
		entity: DeepPartial<BaseUser>,
		updatedEntity: DeepPartial<BaseUser>,
	): Promise<BaseUser> {
		await super.update(
			{ ...entity, email: entity.email.lower },
			{ ...updatedEntity, email: updatedEntity.email.lower },
		);
		return new BaseUser(await this.findOne(updatedEntity));
	}

	/**
	 * Remove base user
	 * @param {DeepPartial<BaseUser>} criteria - removing user
	 * @return {Promise<DeleteResult>}
	 */
	async remove(criteria: DeepPartial<BaseUser>): Promise<DeleteResult> {
		const id = criteria.id || (await this.findOne(criteria)).id,
			result = await this.delete({ id });

		return result;
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
	 * Find one user
	 * @param {FindOptionsWithCustom<BaseUser>} options - function's options
	 */
	findOne(options?: FindOptionsWithCustom<BaseUser>): Promise<BaseUser> {
		return super.findOne({ ...options, email: options.email.lower });
	}
}
