import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { AppService } from 'app/app.service';
import { BaseUser } from 'app/app.entity';

/**
 * Services for user
 */
@Injectable()
export class UserService extends DatabaseRequests<User> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(User) repo: Repository<User>,
		@Inject(forwardRef(() => AppService))
		private appSvc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign new user
	 * @param {DeepPartial<User>} entity - the assigning user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<User>}
	 */
	async assign(
		entity: DeepPartial<User>,
		options?: SaveOptions,
	): Promise<User> {
		const baseUser = await this.appSvc.baseUser.assign(entity.baseUser);
		return this.save({ ...entity, baseUser }, options);
	}

	/**
	 * Modify user
	 * @param {DeepPartial<User>} entity - user
	 * @param {DeepPartial<User>} updatedEntity - modified user
	 * @return {Promise<User>}
	 */
	async modify(
		entity: DeepPartial<User>,
		updatedEntity: DeepPartial<User>,
	): Promise<User> {
		const baseUser = await this.appSvc.baseUser.modify(
			entity.baseUser,
			updatedEntity.baseUser,
		);
		await this.update(entity, { ...updatedEntity, baseUser });
		return this.findOne({ ...updatedEntity, baseUser });
	}

	/**
	 * Remove user
	 * @param {DeepPartial<User>} criteria - deleting user
	 */
	async remove(criteria: DeepPartial<User>) {
		const id =
			(criteria.baseUser as BaseUser).id ||
			(await this.findOne(criteria)).baseUser.id;

		await this.delete({ baseUser: { id } });
		await this.appSvc.baseUser.remove({ id });
	}

	/**
	 * Find user with email
	 * @param {string} input - user's email
	 * @return {Promise<User>} founded user
	 */
	email(input: string): Promise<User> {
		return this.findOne({ baseUser: { email: input.lower } });
	}

	/**
	 * Find user with id
	 * @param {string} id - user's id
	 * @return {Promise<User>} founded user
	 */
	id(id: string): Promise<User> {
		return this.findOne({ baseUser: { id } });
	}

	/**
	 * Updating user's role
	 * @param {string} id - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	async updateRole(id: string, updateRole: UserRole): Promise<User> {
		await this.update(
			{ baseUser: { id } },
			{ baseUser: { id }, role: updateRole },
		);
		return this.findOne({ baseUser: { id } });
	}
}
