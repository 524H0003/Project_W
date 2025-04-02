import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventCreator } from './creator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
}
