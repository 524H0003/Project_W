import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventTag, EventTagAssign, EventTagAttach } from './tag.entity';
import { UseGuards } from '@nestjs/common';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';

@Resolver(() => EventTag)
@UseGuards(RoleGuard)
export class EventTagResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	/**
	 * Tag assign
	 */
	@Mutation(() => EventTag)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignEventTag(@Args('input') input: EventTagAssign) {
		return this.svc.eventTag.assign(input);
	}

	/**
	 * Tag attach to event
	 */
	@Mutation(() => EventTag)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async attachEventTag(@Args('input') input: EventTagAttach) {
		return this.svc.eventTag.attach({ name: input.name }, input.eventId);
	}
}
