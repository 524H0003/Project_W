import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';

/**
 * Event creator service
 */
@Injectable()
export class EventCreatorService extends DatabaseRequests<EventCreator> {
	/**
	 * @ignore
	 */
	constructor(@InjectRepository(EventCreator) repo: Repository<EventCreator>) {
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
}
