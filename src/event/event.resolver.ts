import { UseGuards } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { User } from 'user/user.entity';
import { AccessGuard, Allow, GetServerKey } from 'auth/guards';
import { UserRole } from 'user/user.model';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Event } from './event.entity';
import { EventAssign, EventUpdate, FindEvent } from './event.dto';
import { Paging } from 'app/app.graphql';

@Resolver(() => Event)
@UseGuards(AccessGuard)
export class EventResolver {
	/**
	 * Initiate event resolver
	 */
	constructor(protected svc: AppService) {}

	// Queries
	/**
	 * Query all events
	 */
	@Query(() => [Event]) @Allow([]) getEvents(
		@Args('input') event: FindEvent,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	) {
		return this.svc.event.find({ ...event, skip: index * take, take });
	}

	// Mutations
	/**
	 * Event assign
	 */
	@Mutation(() => Event)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async assignEvent(
		@Args('input') input: EventAssign,
		@GetServerKey('user') { id }: User,
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
		@GetServerKey('user') { id }: User,
	) {
		const event = await this.svc.event.findOne({
			eventCreatedBy: { user: { baseUser: { id } } },
			id: input.id,
		});

		if (event.isNull()) throw new ServerException('Invalid', 'Event', '');

		await this.svc.event.modify(event.id, input);

		return this.svc.event.id(event.id);
	}
}
