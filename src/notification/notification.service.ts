import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { Notification } from './notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { INotificationRelationshipKeys } from 'build/models';

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

	// Abstract
	/**
	 * Assign new notification
	 * @param {DeepPartial<Notification>} entity - the assigning notification
	 * @return {Promise<Notification>}
	 */
	async assign(entity: DeepPartial<Notification>): Promise<Notification> {
		return this.save(entity);
	}

	public modify(id: string, update: DeepPartial<Notification>): Promise<void> {
		update = InterfaceCasting.delete(update, INotificationRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update);
	}
}
