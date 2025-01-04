import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventTag, EventTagAssign, EventTagAttach } from './tag.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { AllowPublic, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Resolver(() => EventTag)
@UseInterceptors(CacheInterceptor)
@UseGuards(RoleGuard)
export class EventTagResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	// Mutations
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

	// Queries
	/**
	 * list all tags server have
	 */
	@Query(() => [EventTag])
	@AllowPublic()
	async listAllTags() {
		return this.svc.eventTag.find({});
	}
}
