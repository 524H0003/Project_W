import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from './utils/typeorm.utils';
import { BaseUser } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DeepPartial,
	DeleteResult,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';

@Injectable()
export class AppService {
	/**
	 * Base user service
	 */
	public baseUser: BaseUserService;
	/**
	 * @ignore
	 */
	constructor(@InjectRepository(BaseUser) repo: Repository<BaseUser>) {
		this.baseUser = new BaseUserService(repo);
	}
}

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
	assign(
		entity: DeepPartial<BaseUser>,
		options?: SaveOptions,
	): Promise<BaseUser> {
		return super.save(entity, options);
	}

	/**
	 * Modify new base user
	 * @param {DeepPartial<BaseUser>} entity - modifying user
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<BaseUser>}
	 */
	modify(
		entity: DeepPartial<BaseUser>,
		options?: SaveOptions,
	): Promise<BaseUser> {
		return super.update(entity, options);
	}

	/**
	 * Remove base user
	 * @param {FindOptionsWhere<BaseUser>} criteria - removing user
	 * @return {Promise<DeleteResult>}
	 */
	async remove(criteria: FindOptionsWhere<BaseUser>): Promise<DeleteResult> {
		const id = criteria.id || (await this.findOne(criteria)).id,
			result = await this.delete({ id });

		return result;
	}

	/**
	 * Find by email
	 * @param {string} input - the email address
	 */
	email(input: string) {
		return this.findOne({ email: input.toLowerCase() });
	}
}
