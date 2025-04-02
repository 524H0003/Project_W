import {
	DatabaseRequests,
	NonFunctionProperties,
} from 'app/utils/typeorm.utils';
import { BaseUser } from './baseUser.entity';
import { Repository } from 'typeorm';
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
	 * @return {Promise<BaseUser>}
	 */
	async assign(
		entity: NonFunctionProperties<IBaseUserEntity>,
	): Promise<BaseUser> {
		return this.save(entity);
	}

	/**
	 * Find by email
	 * @param {string} input - the email address
	 * @return {Promise<BaseUser>}
	 */
	email(input: string): Promise<BaseUser> {
		return this.findOne({ cache: false, email: input.lower });
	}
}
