import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { AppService } from 'app/app.service';

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

		@Inject(forwardRef(() => AppService))
		private svc: AppService,
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
	 * @param {DeepPartial<EventCreator>} criteria - deleting event creator
	 */
	async remove(criteria: DeepPartial<EventCreator>) {
		const id =
			(criteria.user as User).baseUser.id ||
			(await this.findOne(criteria)).user.baseUser.id;

		await this.delete({ user: { baseUser: { id } } });
		await this.svc.usr.remove({ baseUser: { id } });
	}
}
