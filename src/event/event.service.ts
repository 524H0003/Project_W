import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Event } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { AppService } from 'app/app.service';

/**
 * Services for event
 */
@Injectable()
export class EventService extends DatabaseRequests<Event> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Event) repo: Repository<Event>,
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign new event
	 * @param {DeepPartial<Event>} entity - the assigning event
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<Event>}
	 */
	async assign(
		entity: DeepPartial<Event>,
		options?: SaveOptions,
	): Promise<Event> {
		return new Event(await this.save(entity, options));
	}

	/**
	 * Modify event
	 * @param {string} entityId - event's id
	 * @param {DeepPartial<Event>} updatedEntity - modified event
	 * @return {Promise<Event>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<Event>,
	): Promise<Event> {
		await this.update({ id: entityId }, updatedEntity);
		return this.id(entityId);
	}

	/**
	 * Remove event
	 * @param {DeepPartial<Event>} criteria - deleting event
	 */
	async remove(criteria: DeepPartial<Event>) {
		const id = criteria.id || (await this.findOne(criteria)).id;

		await this.delete({ id });
	}
}
