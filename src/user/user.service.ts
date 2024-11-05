import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import {
	DeepPartial,
	DeleteResult,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
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
		const baseUsr = await this.appSvc.baseUser.assign(entity.base);
		return this.save({ ...entity, base: baseUsr }, options);
	}

	/**
	 * Update user
	 * @param {DeepPartial<User>} entity - the updating user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<User>}
	 */
	async modify(
		entity: DeepPartial<User>,
		options?: SaveOptions,
	): Promise<User> {
		const baseUsr = await this.appSvc.baseUser.modify(entity.base);
		return this.update({ ...entity, base: baseUsr }, options);
	}

	/**
	 * Remove user
	 * @param {FindOptionsWhere<User>} criteria - deleting user
	 * @return {Promise<DeleteResult>}
	 */
	async remove(criteria: FindOptionsWhere<User>): Promise<DeleteResult> {
		const id =
				(criteria.base as BaseUser).id ||
				(await this.findOne(criteria)).base.id,
			result = await this.delete({ base: { id } });
		await this.appSvc.baseUser.remove({ id });

		return result;
	}

	/**
	 * Find user with email
	 * @param {string} input - user's email
	 * @return {Promise<User>} founded user
	 */
	email(input: string): Promise<User> {
		return this.findOne({ base: { email: input.toLowerCase() } });
	}

	/**
	 * Find user with id
	 * @param {string} id - user's id
	 * @return {Promise<User>} founded user
	 */
	id(id: string): Promise<User> {
		return this.findOne({ base: { id } });
	}

	/**
	 * Updating user's role
	 * @param {string} userId - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	async updateRole(userId: string, updateRole: UserRole): Promise<User> {
		return this.update({ base: { id: userId }, role: updateRole });
	}
}
