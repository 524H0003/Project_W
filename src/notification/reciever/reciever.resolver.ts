import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reciever } from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow, GetServerKey } from 'auth/guards';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import {
	ReadNotification,
	ReadNotificationMany,
	RecieverAssign,
	RecieverAssignMany,
} from './reciever.graphql';
import { Paging } from 'app/app.graphql';

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
	@Mutation(() => Reciever) @Allow([UserRole.student]) async readNotification(
		@Args('input') { recieverId }: ReadNotification,
	) {
		await this.svc.recie.read(recieverId);
		return this.svc.recie.id(recieverId);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever])
	@Allow([UserRole.student])
	async readNotificationMany(
		@Args('input') { recieversId }: ReadNotificationMany,
	) {
		await this.svc.recie.readMany(recieversId);
		return Promise.all(recieversId.map((i) => this.svc.recie.id(i)));
	}

	// Queries
	/**
	 * list all notification
	 */
	@Query(() => [Reciever]) @Allow([UserRole.student]) listAllNotifications(
		@Args('isRead', { nullable: true }) isRead: boolean,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
		@GetServerKey('user') { id }: User,
	) {
		if (isRead !== undefined)
			return this.svc.recie.find({
				isRead,
				toUser: { id },
				take,
				skip: index * take,
			});
		return this.svc.recie.find({ toUser: { id }, take, skip: index * take });
	}
}
