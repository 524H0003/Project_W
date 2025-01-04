import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
	ReadNotification,
	ReadNotificationMany,
	Reciever,
	RecieverAssign,
	RecieverAssignMany,
} from './reciever.entity';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Resolver(() => Reciever)
@UseInterceptors(CacheInterceptor)
@UseGuards(RoleGuard)
export class RecieverResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	// Mutations
	/**
	 * Assign user to recieve notification
	 */
	@Mutation(() => Reciever)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignReciever(@Args('input') input: RecieverAssign) {
		return this.svc.recie.assign(input.notificationId, input.userId);
	}

	/**
	 * Assign many user to recieve notification
	 */
	@Mutation(() => [Reciever])
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignRecieverMany(@Args('input') input: RecieverAssignMany) {
		return this.svc.recie.assignMany(input.notificationId, input.usersId);
	}

	/**
	 * Read notification
	 */
	@Mutation(() => Reciever)
	@Roles([UserRole.student])
	async readNotification(@Args('input') input: ReadNotification) {
		return this.svc.recie.read(input.recieverId);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever])
	@Roles([UserRole.student])
	async readNotificationMany(@Args('input') input: ReadNotificationMany) {
		return this.svc.recie.readMany(input.recieversId);
	}

	// Queries
	/**
	 * list all notification
	 */
	@Query(() => [Reciever])
	@Roles([UserRole.student])
	async listAllNotifications(
		@Args('isRead', { nullable: true }) isRead: boolean,
		@CurrentUser() user: User,
	) {
		if (isRead !== undefined)
			return this.svc.recie.find({
				isRead,
				toUser: { baseUser: { id: user.id } },
			});
		return this.svc.recie.find({ toUser: { baseUser: { id: user.id } } });
	}
}
