import { Args, Directive, Mutation, Query, Resolver } from '@nestjs/graphql';
import { EventTag } from './tag.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
import { UserRole } from 'user/user.model';
import {
	EventTagAssign,
	EventTagAttach,
	FindTag,
	EventTagPage,
} from './tag.dto';
import { CacheControl } from 'app/graphql/graphql.decorator';
import { Paging } from 'app/app.graphql';
import { paginateResponse } from 'app/graphql/graphql.utils';
import { EventTagService } from './tag.service';

@Resolver(() => EventTag)
@UseGuards(AccessGuard)
export class EventTagResolver {
	/**
	 * Initiate event tag resolver
	 */
	constructor(private tag: EventTagService) {}

	// Mutations
	/**
	 * Tag assign
	 */
	@Mutation(() => EventTag)
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignEventTag(@Args('input') input: EventTagAssign) {
		return this.tag.assign(input);
	}

	/**
	 * Tag attach to event
	 */
	@Directive(
		'@deprecated(reason: "This query will be removed in the next version")',
	)
	@Mutation(() => EventTag)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async attachEventTag(@Args('input') { name, eventId }: EventTagAttach) {
		await this.tag.attach({ name }, eventId);
		return this.tag.findOne({ name });
	}

	// Queries
	/**
	 * list all tags server have
	 */
	@CacheControl({ maxAge: (5).m2s })
	@Query(() => EventTagPage)
	@Allow([])
	async getTags(
		@Args('input') tag: FindTag,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	): Promise<EventTagPage> {
		return paginateResponse(
			this.tag,
			await this.tag.find({ ...tag, take, skip: take * index }),
			{ index, take },
		);
	}
}
