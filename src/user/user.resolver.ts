import { BadRequestException, UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { isUUID } from 'class-validator';
import { User } from './user.entity';
import { Role } from './user.model';
import { UserService } from './user.service';

@Resolver(() => User)
@UseGuards(RoleGuard)
export class UserResolver {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@Roles([Role.USER])
	async user(@Args('id') id: string) {
		if (isUUID(id)) {
			const user = await this.usrSvc.id(id);
			if (user) return user.info;
		}
		throw new BadRequestException('User not found');
	}

	@Query(() => [User])
	@Roles([Role.ADMIN])
	async userAll() {
		return (await this.usrSvc.all()).map((_) => _.info);
	}
}
