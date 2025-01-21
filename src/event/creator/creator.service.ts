import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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

		@Inject(forwardRef(() => AppService)) private svc: AppService,
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
			(criteria.user as User).id || (await this.findOne(criteria)).user.id;

		await this.delete({ user: { baseUser: { id } } });
		await this.svc.user.remove(id);
	}

	/**
	 * Find event creator by id
	 * @param {string} id - event creator's id
	 * @return {Promise<EventCreator>}
	 */
	id(id: string): Promise<EventCreator> {
		return this.findOne({ user: { baseUser: { id } } });
	}
}
