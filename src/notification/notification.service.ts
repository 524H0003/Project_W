import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Notification } from './notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';

@Injectable()
export class NotificationService extends DatabaseRequests<Notification> {
	/**
	 * Initiate notification service
	 */
	constructor(
		@InjectRepository(Notification) repo: Repository<Notification>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, Notification);
	}

	/**
	 * Assign new notification
	 * @param {DeepPartial<Notification>} entity - the assigning notification
	 * @return {Promise<Notification>}
	 */
	async assign(entity: DeepPartial<Notification>): Promise<Notification> {
		return this.save(entity);
	}
}
