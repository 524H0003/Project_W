import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { EventParticipator } from './participator.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from 'app/app.service';

/**
 * Participator services
 */
@Injectable()
export class EventParticipatorService extends DatabaseRequests<EventParticipator> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(EventParticipator) repo: Repository<EventParticipator>,
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
	) {
		super(repo);
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
			throw new BadRequestException('Invalid_Event_Request');

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
}
