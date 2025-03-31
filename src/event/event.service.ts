import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';

/**
 * Services for event
 */
@Injectable()
export class EventService extends DatabaseRequests<Event> {
	/**
	 * Initiate event service
	 */
	constructor(
		@InjectRepository(Event) repo: Repository<Event>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, Event);
	}

	/**
	 * Assign new event
	 * @param {DeepPartial<Event>} entity - the assigning event
	 * @return {Promise<Event>}
	 */
	async assign(entity: DeepPartial<Event>): Promise<Event> {
		return this.save(entity);
	}

	/**
	 * Modify event
	 * @param {string} entityId - event's id
	 * @param {DeepPartial<Event>} updatedEntity - modified event
	 */
	async modify(entityId: string, updatedEntity: DeepPartial<Event>) {
		await this.update({ id: entityId }, updatedEntity);
	}

	/**
	 * Remove event
	 * @param {string} entityId - event's id
	 */
	async remove(entityId: string) {
		await this.delete({ id: entityId });
	}
}
