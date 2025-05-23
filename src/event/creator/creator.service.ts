import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
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

	// Abstract
	/**
	 * Assign event creator
	 * @param {User} user - the user assign for event creator
	 */
	assign(user: User): Promise<EventCreator> {
		return this.save({ user });
	}

	public async modify(
		id: string,
		update: DeepPartial<EventCreator>,
	): Promise<void> {
		await this.svc.user.modify(id, update.user);
	}
}
