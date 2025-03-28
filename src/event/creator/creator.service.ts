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
	 * Initiate event creator service
	 */
	constructor(
		@InjectRepository(EventCreator) repo: Repository<EventCreator>,

		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, EventCreator);
	}

	/**
	 * Assign event creator
	 * @param {User} user - the user assign for event creator
	 */
	assign(user: User): Promise<EventCreator> {
		return this.save({ user });
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
}
