import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { AppService } from 'app/app.service';

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
		const baseUser = await this.svc.baseUser.assign(entity.baseUser),
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
		const id = (
			await this.svc.baseUser.modify(entityId, updatedEntity.baseUser)
		).id;
		await this.update({ baseUser: { id } }, updatedEntity);
		return this.id(entityId);
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
	 * @return {Promise<User>} founded user
	 */
	email(input: string): Promise<User> {
		return this.findOne({ baseUser: { email: input.lower }, deep: 2 });
	}

	/**
	 * Find user by id
	 * @param {string} id - user's id
	 * @return {Promise<User>}
	 */
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
		return this.modify(id, { role: updateRole });
	}
}
