import {
	BadRequestException,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { isUUID } from 'class-validator';
import { User } from './user.entity';
import { UserRole } from './user.model';
import { UserService } from './user.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Resolver(() => User)
@UseInterceptors(CacheInterceptor)
@UseGuards(RoleGuard)
export class UserResolver {
	constructor(private usrSvc: UserService) {}

	// Queries
	@Query(() => User)
	@Roles([UserRole.student])
	async user(@Args('id') id: string) {
		if (isUUID(id)) {
			const user = await this.usrSvc.id(id);
			if (user) return user.info;
		}
		throw new BadRequestException('User not found');
	}

	@Query(() => [User])
	@Roles([UserRole.faculty])
	async userAll() {
		return (await this.usrSvc.find()).map((_) => _.info);
	}
}
