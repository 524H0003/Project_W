import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reciever } from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { GetRequest, AccessGuard, Roles } from 'auth/guards/access.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import {
	ReadNotification,
	ReadNotificationMany,
	RecieverAssign,
	RecieverAssignMany,
} from './reciever.graphql';

@Resolver(() => Reciever)
@UseGuards(AccessGuard)
export class RecieverResolver {
	/**
	 * Initiate notification reciever resolve
	 */
	constructor(protected svc: AppService) {}

	// Mutations
	/**
	 * Assign user to recieve notification
	 */
	@Mutation(() => Reciever)
	@Roles([UserRole.faculty, UserRole.enterprise])
	assignReciever(@Args('input') input: RecieverAssign) {
		return this.svc.recie.assign(input.notificationId, input.userId);
	}

	/**
	 * Assign many user to recieve notification
	 */
	@Mutation(() => [Reciever])
	@Roles([UserRole.faculty, UserRole.enterprise])
	assignRecieverMany(@Args('input') input: RecieverAssignMany) {
		return this.svc.recie.assignMany(input.notificationId, input.usersId);
	}

	/**
	 * Read notification
	 */
	@Mutation(() => Reciever) @Roles([UserRole.student]) readNotification(
		@Args('input') input: ReadNotification,
	) {
		return this.svc.recie.read(input.recieverId);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever]) @Roles([UserRole.student]) readNotificationMany(
		@Args('input') input: ReadNotificationMany,
	) {
		return this.svc.recie.readMany(input.recieversId);
	}

	// Queries
	/**
	 * list all notification
	 */
	@Query(() => [Reciever]) @Roles([UserRole.student]) listAllNotifications(
		@Args('isRead', { nullable: true }) isRead: boolean,
		@GetRequest('user') user: User,
	) {
		if (isRead !== undefined)
			return this.svc.recie.find({
				isRead,
				toUser: { baseUser: { id: user.id } },
			});
		return this.svc.recie.find({ toUser: { baseUser: { id: user.id } } });
	}
}
