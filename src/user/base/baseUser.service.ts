import {
	DatabaseRequests,
	NonFunctionProperties,
} from 'app/utils/typeorm.utils';
import { BaseUser } from './baseUser.entity';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { IBaseUserEntity } from './baseUser.model';
import { InjectRepository } from '@nestjs/typeorm';

/**
 * Base user service
 */
export class BaseUserService extends DatabaseRequests<BaseUser> {
	/**
	 * Initiate base user service
	 */
	constructor(@InjectRepository(BaseUser) repo: Repository<BaseUser>) {
		super(repo, BaseUser);
	}

	/**
	 * Assign new base user
	 * @param {BaseUser} entity - assigning user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<BaseUser>}
	 */
	async assign(
		entity: NonFunctionProperties<IBaseUserEntity>,
		options?: SaveOptions,
	): Promise<BaseUser> {
		return this.save(entity, options);
	}

	/**
	 * Modify new base user
	 * @param {string} entityId - base user's id
	 * @param {DeepPartial<BaseUser>} updatedEntity - modified base user
	 */
	async modify(entityId: string, updatedEntity: DeepPartial<BaseUser>) {
		if (!updatedEntity) return;

		await this.update({ id: entityId }, updatedEntity);
	}

	/**
	 * Find by email
	 * @param {string} input - the email address
	 * @return {Promise<BaseUser>}
	 */
	email(input: string): Promise<BaseUser> {
		return this.findOne({ cache: false, email: input.lower });
	}

	/**
	 * Remove base user by id
	 */
	remove(id: string) {
		return this.delete({ id });
	}
}
