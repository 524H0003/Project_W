import { BadRequestException, UseGuards } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { User } from 'user/user.entity';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Event, EventAssign, EventUpdate } from './event.entity';
import { IEventInfoKeys } from 'models';
import { InterfaceCasting } from 'app/utils/utils';

@Resolver(() => Event)
@UseGuards(RoleGuard)
export class EventResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	/**
	 * Event assign
	 */
	@Mutation(() => Event)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignEvent(
		@Args('input') input: EventAssign,
		@CurrentUser() user: User,
	) {
		return this.svc.event.assign({
			...input,
			eventCreatedBy: await this.svc.eventcreator.id(user.baseUser.id),
		});
	}

	/**
	 * Update event
	 */
	@Mutation(() => Event)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateEvent(
		@Args('input') input: EventUpdate,
		@CurrentUser() user: User,
	) {
		const event = await this.svc.event.findOne({
			eventCreatedBy: { user: { baseUser: { id: user.baseUser.id } } },
			id: input.id,
		});

		if (!event) throw new BadRequestException('Invalid_Event_Id');

		input = InterfaceCasting.quick(input, IEventInfoKeys);

		return this.svc.event.modify(event.id, input);
	}
}
