import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reciever } from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { GetRequest, AccessGuard, Allow } from 'auth/guards';
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
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignReciever(@Args('input') input: RecieverAssign) {
		return this.svc.recie.assign(input.notificationId, input.userId);
	}

	/**
	 * Assign many user to recieve notification
	 */
	@Mutation(() => [Reciever])
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignRecieverMany(@Args('input') input: RecieverAssignMany) {
		return this.svc.recie.assignMany(input.notificationId, input.usersId);
	}

	/**
	 * Read notification
	 */
	@Mutation(() => Reciever) @Allow([UserRole.student]) readNotification(
		@Args('input') input: ReadNotification,
	) {
		return this.svc.recie.read(input.recieverId);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever]) @Allow([UserRole.student]) readNotificationMany(
		@Args('input') input: ReadNotificationMany,
	) {
		return this.svc.recie.readMany(input.recieversId);
	}

	// Queries
	/**
	 * list all notification
	 */
	@Query(() => [Reciever]) @Allow([UserRole.student]) listAllNotifications(
		@Args('isRead', { nullable: true }) isRead: boolean,
		@GetRequest('user') { id }: User,
	) {
		if (isRead !== undefined)
			return this.svc.recie.find({ isRead, toUser: { id } });
		return this.svc.recie.find({ toUser: { id } });
	}
}
