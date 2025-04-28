import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { EventParticipator } from './participator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { IEventParticipatorRelationshipsKeys } from 'build/models';

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

	// Abstract
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
		const event = await this.svc.event.id(eventId);

		if (!event.positionsAvailable)
			throw new ServerException('Invalid', 'Event', 'Access');

		await this.svc.event.modify(eventId, {
			positionsAvailable: event.positionsAvailable - 1,
		});

		return this.save({
			fromEvent: await this.svc.event.id(eventId),
			participatedBy: await this.svc.user.id(participatorId),
			registeredAt: new Date(),
		});
	}

	public modify(
		id: string,
		update: DeepPartial<EventParticipator>,
	): Promise<void> {
		update = InterfaceCasting.delete(
			update,
			IEventParticipatorRelationshipsKeys,
		);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update);
	}
}
