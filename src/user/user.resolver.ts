import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AppService } from 'app/app.service';
import { AccessGuard, Allow, GetServerKey } from 'auth/guards';
import { User } from './user.entity';
import { FindUser } from './user.dto';
import { Paging } from 'app/app.graphql';

@Resolver(() => User)
@UseGuards(AccessGuard)
export class UserResolver {
	/**
	 * Initiate user resolver
	 */
	constructor(protected svc: AppService) {}

	@ResolveField(() => String) name(@Parent() { baseUser }: User) {
		return baseUser.name;
	}

	@ResolveField(() => String) avatarPath(@Parent() { baseUser }: User) {
		return baseUser.avatarPath;
	}

	@ResolveField(() => String) email(@Parent() { baseUser }: User) {
		return baseUser.email;
	}
	// Queries
	/**
	 * Query user by request
	 */
	@Query(() => [User]) @Allow([]) getUsers(
		@Args('input') user: FindUser,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	) {
		return this.svc.user.find({
			...user,
			baseUser: user,
			take,
			skip: index * take,
		});
	}

	/**
	 * Get current user
	 */
	@Query(() => User) @Allow([]) getCurrent(@GetServerKey('user') user: User) {
		return user;
	}
}
