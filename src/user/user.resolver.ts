import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AppService } from 'app/app.service';
import { AccessGuard, Allow } from 'auth/guards';
import { User } from './user.entity';
import { FindUser } from './user.dto';

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
	@Query(() => [User]) @Allow([]) getUsers(@Args('input') user: FindUser) {
		return this.svc.user.find({ ...user, baseUser: user });
	}
}
