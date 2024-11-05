import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';

/**
 * Event creator service
 */
@Injectable()
export class EventCreatorService extends DatabaseRequests<EventCreator> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(EventCreator) repo: Repository<EventCreator>,
		private usrSvc: UserService,
	) {
		super(repo);
	}

	/**
	 * Assign event creator
	 * @param {User} user - the user assign for event creator
	 * @return {Promise<EventCreator>}
	 */
	async assign(user: User): Promise<EventCreator> {
		return await this.save({ user });
	}

	/**
	 * Remove event creator
	 * @param {FindOptionsWhere<EventCreator>} criteria - deleting event creator
	 * @return {Promise<DeleteResult>}
	 */
	async remove(
		criteria: FindOptionsWhere<EventCreator>,
	): Promise<DeleteResult> {
		const id =
				(criteria.user as User).base.id ||
				(await this.findOne(criteria)).user.base.id,
			result = await this.delete({ user: { base: { id } } });
		await this.usrSvc.remove({ base: { id } });

		return result;
	}
}
