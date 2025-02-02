import { UseGuards } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { User } from 'user/user.entity';
import { GetRequest, AccessGuard, Roles } from 'auth/guards/access.guard';
import { UserRole } from 'user/user.model';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Event, EventAssign, EventUpdate } from './event.entity';

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
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignEvent(
		@Args('input') input: EventAssign,
		@GetRequest('user') user: User,
	) {
		return this.svc.event.assign({
			...input,
			eventCreatedBy: await this.svc.eventCreator.id(user.id),
		});
	}

	/**
	 * Update event
	 */
	@Mutation(() => Event)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateEvent(
		@Args('input') input: EventUpdate,
		@GetRequest('user') user: User,
	) {
		const event = await this.svc.event.findOne({
			eventCreatedBy: { user: { baseUser: { id: user.id } } },
			id: input.id,
		});

		if (!event) throw new ServerException('Invalid', 'Event', '', 'user');

		return this.svc.event.modify(event.id, input);
	}
}
