import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Notification } from './notification.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { AppService } from 'app/app.service';

@Injectable()
export class NotificationService extends DatabaseRequests<Notification> {
	constructor(
		@InjectRepository(Notification) repo: Repository<Notification>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign new notification
	 * @param {DeepPartial<Notification>} entity - the assigning notification
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<Notification>}
	 */
	async assign(
		entity: DeepPartial<Notification>,
		options?: SaveOptions,
	): Promise<Notification> {
		return new Notification(await this.save(entity, options));
	}

	/**
	 * Modify notification
	 * @param {string} entityId - notification's id
	 * @param {DeepPartial<Notification>} updatedEntity - modified notification
	 * @return {Promise<Notification>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<Notification>,
	): Promise<Notification> {
		await this.update({ id: entityId }, updatedEntity);
		return this.id(entityId);
	}
}
