import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventParticipator } from './participator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';

/**
 * Participator services
 */
@Injectable()
export class EventParticipatorService extends DatabaseRequests<EventParticipator> {
	/**
	 * Initiate event participator service
	 */
	constructor(
		@InjectRepository(EventParticipator) repo: Repository<EventParticipator>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, EventParticipator);
	}

	/**
	 * Assign participator to event
	 * @param {string} participatorId - participator's id
	 * @param {string} eventId - event's id
	 * @return {Promise<EventParticipator>}
	 */
	async assign(
		participatorId: string,
		eventId: string,
	): Promise<EventParticipator> {
		const event = await this.svc.event.findOne({ id: eventId });

		if (!event.positionsAvailable)
			throw new ServerException('Invalid', 'Event', 'Access');

		await this.svc.event.modify(eventId, {
			positionsAvailable: event.positionsAvailable - 1,
		});

		return new EventParticipator(
			await this.save({
				fromEvent: { id: eventId },
				participatedBy: { baseUser: { id: participatorId } },
				registeredAt: new Date(),
			}),
		);
	}

	/**
	 * Modify participator infomations
	 * @param {string} entityId - participator's id
	 * @param {DeepPartial<EventParticipator>} updatedEntity - modified participator infomations
	 * @return {Promise<EventParticipator>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<EventParticipator>,
	): Promise<EventParticipator> {
		if (updatedEntity) await this.update({ id: entityId }, updatedEntity);
		return this.id(entityId);
	}
}
