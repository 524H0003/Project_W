import { UseGuards } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { User } from 'user/user.entity';
import { GetRequest, AccessGuard, Allow } from 'auth/guards/access.guard';
import { UserRole } from 'user/user.model';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Event } from './event.entity';
import { EventAssign, EventUpdate } from './event.dto';

@Resolver(() => Event)
@UseGuards(AccessGuard)
export class EventResolver {
	/**
	 * Initiate event resolver
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Event assign
	 */
	@Mutation(() => Event)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async assignEvent(
		@Args('input') input: EventAssign,
		@GetRequest('user') { id }: User,
	) {
		return this.svc.event.assign({
			...input,
			eventCreatedBy: await this.svc.eventCreator.id(id),
		});
	}

	/**
	 * Update event
	 */
	@Mutation(() => Event)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async updateEvent(
		@Args('input') input: EventUpdate,
		@GetRequest('user') { id }: User,
	) {
		const event = await this.svc.event.findOne({
			eventCreatedBy: { user: { baseUser: { id } } },
			id: input.id,
		});

		if (!event) throw new ServerException('Invalid', 'Event', '');

		return this.svc.event.modify(event.id, input);
	}
}
