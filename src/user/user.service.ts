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
		const baseUser = await this.appSvc.baseUser.assign(entity.baseUser),
			result = await this.save({ ...entity, baseUser }, options);
		return new User({ ...result, ...result.baseUser });
	}

	/**
	 * Modify user
	 * @param {string} entityId - user's id
	 * @param {DeepPartial<User>} updatedEntity - modified user
	 * @return {Promise<User>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<User>,
	): Promise<User> {
		const baseUser = await this.appSvc.baseUser.modify(
			entityId,
			updatedEntity.baseUser,
		);
		await this.update({ baseUser }, { ...updatedEntity, baseUser });
		return this.id(entityId);
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
		return this.findOne({ baseUser: { email: input.lower }, deep: 2 });
	}

	id(id: string): Promise<User> {
		return this.findOne({ baseUser: { id }, deep: 2 });
	}

	/**
	 * Updating user's role
	 * @param {string} id - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	async updateRole(id: string, updateRole: UserRole): Promise<User> {
		await this.update({ baseUser: { id } }, { role: updateRole });
		return this.id(id);
	}
}
