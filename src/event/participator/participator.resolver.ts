import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventParticipator } from './participator.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import {
	EventParticipatorAssign,
	EventParticipatorUpdate,
} from './participator.graphql';

@Resolver(() => EventParticipator)
@UseGuards(RoleGuard)
export class EventParticipatorResolver {
	/**
	 * Initiate event participator resolver
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Participator assign
	 */
	@Mutation(() => EventParticipator)
	@Roles([UserRole.student])
	async assignParticipator(@Args('input') input: EventParticipatorAssign) {
		return this.svc.eventParticipator.assign(input.userId, input.eventId);
	}

	/**
	 * Update participator infomations
	 */
	@Mutation(() => EventParticipator)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateParticipator(
		@Args('input') input: EventParticipatorUpdate,
		@CurrentUser() user: User,
	) {
		const participator = await this.svc.eventParticipator.findOne({
			id: input.id,
			fromEvent: { eventCreatedBy: { user: { baseUser: { id: user.id } } } },
		});

		if (!participator) throw new ServerException('Invalid', 'User', '', 'user');

		return this.svc.eventParticipator.modify(participator.id, input);
	}
}
