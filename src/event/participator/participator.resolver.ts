import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
	EventParticipator,
	EventParticipatorAssign,
	EventParticipatorUpdate,
} from './participator.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { CurrentUserId, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';

@Resolver(() => EventParticipator)
@UseGuards(RoleGuard)
export class EventParticipatorResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	/**
	 * Participator assign
	 */
	@Mutation(() => EventParticipator)
	@Roles([UserRole.student])
	async assignParticipator(@Args('input') input: EventParticipatorAssign) {
		return this.svc.eventParti.assign(input.userId, input.eventId);
	}

	/**
	 * Update participator infomations
	 */
	@Mutation(() => EventParticipator)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateParticipator(
		@Args('input') input: EventParticipatorUpdate,
		@CurrentUserId() userId: string,
	) {
		const participator = await this.svc.eventParti.findOne({
			id: input.id,
			fromEvent: { eventCreatedBy: { user: { baseUser: { id: userId } } } },
		});

		if (!participator) throw new BadRequestException('Invalid_Participator_Id');

		return this.svc.eventParti.modify(participator.id, input);
	}
}
