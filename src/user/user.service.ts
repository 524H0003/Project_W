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
		const baseUsr = await this.appSvc.baseUser.assign(entity.user);
		return this.save({ ...entity, user: baseUsr }, options);
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
		const baseUsr = await this.appSvc.baseUser.modify(entity.user);
		return this.update({ ...entity, user: baseUsr }, options);
	}

	/**
	 * Remove user
	 * @param {FindOptionsWhere<User>} criteria - deleting user
	 * @return {Promise<DeleteResult>}
	 */
	async remove(criteria: FindOptionsWhere<User>): Promise<DeleteResult> {
		const result = await this.remove(criteria);
		await this.appSvc.baseUser.remove({
			...new BaseUser(criteria.user as BaseUser),
		});
		return result;
	}

	/**
	 * Find user with email
	 * @param {string} input - the user's email
	 * @return {Promise<User>} the user's infomations that found
	 */
	email(input: string): Promise<User> {
		return this.findOne({ user: { email: input.toLowerCase() } });
	}

	/**
	 * Updating user's role
	 * @param {string} userId - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	async updateRole(userId: string, updateRole: UserRole): Promise<User> {
		return this.update({ user: { id: userId }, role: updateRole });
	}
}
