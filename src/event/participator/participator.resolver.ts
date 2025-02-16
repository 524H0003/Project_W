import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventParticipator } from './participator.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, GetRequest, Allow } from 'auth/guards';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import {
	EventParticipatorAssign,
	EventParticipatorUpdate,
} from './participator.graphql';

@Resolver(() => EventParticipator)
@UseGuards(AccessGuard)
export class EventParticipatorResolver {
	/**
	 * Initiate event participator resolver
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Participator assign
	 */
	@Mutation(() => EventParticipator)
	@Allow([UserRole.student])
	assignParticipator(
		@Args('input') { userId, eventId }: EventParticipatorAssign,
	) {
		return this.svc.eventParticipator.assign(userId, eventId);
	}

	/**
	 * Update participator infomations
	 */
	@Mutation(() => EventParticipator)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async updateParticipator(
		@Args('input') input: EventParticipatorUpdate,
		@GetRequest('user') user: User,
	) {
		const participator = await this.svc.eventParticipator.findOne({
			id: input.id,
			fromEvent: { eventCreatedBy: { user: { baseUser: { id: user.id } } } },
		});

		if (!participator) throw new ServerException('Invalid', 'User', '');

		return this.svc.eventParticipator.modify(participator.id, input);
	}
}
