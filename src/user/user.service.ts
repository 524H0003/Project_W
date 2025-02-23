import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests, ExtendOptions } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './user.entity';
import { IUserAuthentication, IUserSensitive, UserRole } from './user.model';
import { AppService } from 'app/app.service';
import { IBaseUserInfo } from 'app/app.model';

/**
 * Services for user
 */
@Injectable()
export class UserService extends DatabaseRequests<User> {
	/**
	 * Initiate user service
	 */
	constructor(
		@InjectRepository(User) repo: Repository<User>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, User);
	}

	/**
	 * Assign new user
	 * @param {User} entity - the assigning user
	 */
	async assign(
		entity: IUserAuthentication & IBaseUserInfo & IUserSensitive,
		options?: ExtendOptions,
	): Promise<User> {
		const baseUser = await this.svc.baseUser.assign(entity, options),
			user = new User({ ...entity, ...baseUser });

		return this.save(user);
	}

	/**
	 * Modify user
	 * @param {string} entityId - user's id
	 * @param {DeepPartial<User>} updatedEntity - modified user
	 * @param {ExtendOptions} options - function options
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<User>,
		options?: ExtendOptions,
	): Promise<User> {
		const { id } = await this.svc.baseUser.modify(
			entityId,
			updatedEntity.baseUser,
		);
		await this.update({ baseUser: { id } }, updatedEntity);
		return this.id(entityId, options);
	}

	/**
	 * Remove user
	 * @param {string} entityId - user's id
	 */
	async remove(entityId: string) {
		await this.delete({ baseUser: { id: entityId } });
		await this.svc.baseUser.remove(entityId);
	}

	/**
	 * Find user with email
	 * @param {string} input - user's email
	 * @param {ExtendOptions} options - function options
	 */
	email(input: string, options?: ExtendOptions): Promise<User> {
		return this.findOne({
			baseUser: { email: input.lower },
			deep: 2,
			...options,
		});
	}

	/**
	 * Find user by id
	 * @param {string} id - user's id
	 * @param {ExtendOptions} options - function options
	 * @return {Promise<User>}
	 */
	id(id: string, options?: ExtendOptions): Promise<User> {
		return this.findOne({ baseUser: { id }, deep: 2, ...options });
	}

	/**
	 * Updating user's role
	 * @param {string} id - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	updateRole(id: string, updateRole: UserRole): Promise<User> {
		return this.modify(id, { role: updateRole });
	}

	/**
	 * Find full user infomations
	 * @param {string} id - user id
	 */
	async info(id: string): Promise<object> {
		if (!id) throw new ServerException('Invalid', 'ID', '');

		const student = await this.svc.student.id(id),
			employee = await this.svc.employee.id(id);

		if (student.isNull() && employee.isNull()) return (await this.id(id)).info;

		return {
			...(student.isNull() ? {} : student.info),
			...(employee.isNull() ? {} : employee.info),
		};
	}
}
