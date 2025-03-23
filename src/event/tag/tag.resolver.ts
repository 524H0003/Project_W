import { Args, Directive, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventTag } from './tag.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { EventTagAssign, EventTagAttach } from './tag.graphql';
import { CacheControl } from 'app/graphql/graphql.decorator';

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
	@Directive('@deprecated(reason: "This query will be removed in the next version")')
	@Mutation(() => EventTag)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async attachEventTag(@Args('input') { name, eventId }: EventTagAttach) {
		return this.svc.eventTag.attach({ name }, eventId);
	}

	// Queries
	/**
	 * list all tags server have
	 */
	@CacheControl({ maxAge: 50 })
	@Query(() => [EventTag])
	@Allow([])
	listAllTags() {
		return this.svc.eventTag.find({});
	}
}
