import { UseGuards } from '@nestjs/common';
import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { AccessGuard, Allow, GetServerKey } from 'auth/guards';
import { User } from './user.entity';
import { FindUser, UserPage } from './user.dto';
import { Paging } from 'app/app.graphql';
import { UserService } from './user.service';
import { paginateResponse } from 'app/graphql/graphql.utils';

@Resolver()
@UseGuards(AccessGuard)
export class UserResolver {
	/**
	 * Initiate user resolver
	 */
	constructor(private user: UserService) {}

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
	@Query(() => UserPage) @Allow([]) async getUsers(
		@Args('input') user: FindUser,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
	): Promise<UserPage> {
		return paginateResponse(
			this.user,
			await this.user.find({
				...user,
				baseUser: user,
				take,
				skip: index * take,
			}),
			{ take, index },
		);
	}

	/**
	 * Get current user
	 */
	@Query(() => User) @Allow([]) getCurrent(@GetServerKey('user') user: User) {
		return user;
	}
}
