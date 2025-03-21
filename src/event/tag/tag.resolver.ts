import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventTag } from './tag.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { EventTagAssign, EventTagAttach } from './tag.graphql';

@Resolver(() => EventTag)
@UseGuards(AccessGuard)
export class EventTagResolver {
	/**
	 * Initiate event tag resolver
	 */
	constructor(protected svc: AppService) {}

	// Mutations
	/**
	 * Tag assign
	 */
	@Mutation(() => EventTag)
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignEventTag(@Args('input') input: EventTagAssign) {
		return this.svc.eventTag.assign(input);
	}

	/**
	 * Tag attach to event
	 */
	@Mutation(() => EventTag)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async attachEventTag(@Args('input') { name, eventId }: EventTagAttach) {
		return this.svc.eventTag.attach({ name }, eventId);
	}

	// Queries
	/**
	 * list all tags server have
	 */
	@Query(() => [EventTag]) @Allow([]) listAllTags() {
		return this.svc.eventTag.find({});
	}
}
