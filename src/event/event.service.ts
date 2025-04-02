import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { IEventRelationshipsKeys } from 'build/models';

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

	// Abstract
	/**
	 * Assign new event
	 * @param {DeepPartial<Event>} entity - the assigning event
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<Event>}
	 */
	async assign(entity: DeepPartial<Event>): Promise<Event> {
		return this.save(entity);
	}

	public modify(
		id: string,
		update: DeepPartial<Event>,
		raw?: boolean,
	): Promise<void> {
		update = InterfaceCasting.delete(update, IEventRelationshipsKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
