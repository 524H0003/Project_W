import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Reciever } from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow, GetServerKey } from 'auth/guards';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';
import {
	ReadNotification,
	ReadNotificationMany,
	RecieverAssign,
	RecieverAssignMany,
	RecieverPage,
} from './reciever.dto';
import { Paging } from 'app/app.graphql';
import { RecieverService } from './reciever.service';
import { paginateResponse } from 'app/graphql/graphql.utils';

@Resolver(() => Reciever)
@UseGuards(AccessGuard)
export class RecieverResolver {
	/**
	 * Initiate notification reciever resolve
	 */
	constructor(private reciever: RecieverService) {}

	// Mutations
	/**
	 * Assign user to recieve notification
	 */
	@Mutation(() => Reciever)
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignReciever(@Args('input') input: RecieverAssign) {
		return this.reciever.assign(input.notificationId, input.userId);
	}

	/**
	 * Assign many user to recieve notification
	 */
	@Mutation(() => [Reciever])
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignRecieverMany(@Args('input') input: RecieverAssignMany) {
		return this.reciever.assignMany(input.notificationId, input.usersId);
	}

	/**
	 * Read notification
	 */
	@Mutation(() => Reciever) @Allow([UserRole.student]) async readNotification(
		@Args('input') { recieverId }: ReadNotification,
	) {
		await this.reciever.read(recieverId);
		return this.reciever.id(recieverId);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever])
	@Allow([UserRole.student])
	async readNotificationMany(
		@Args('input') { recieversId }: ReadNotificationMany,
	) {
		await this.reciever.readMany(recieversId);
		return Promise.all(recieversId.map((i) => this.reciever.id(i)));
	}

	// Queries
	/**
	 * list all notification
	 */
	@Query(() => RecieverPage) @Allow([UserRole.student]) async getNotifications(
		@Args('isRead', { nullable: true }) isRead: boolean,
		@Args('page', { nullable: true })
		{ index, take }: Paging = { index: 0, take: 10e10 },
		@GetServerKey('user') { id }: User,
	): Promise<RecieverPage> {
		if (isRead !== undefined)
			return paginateResponse(
				this.reciever,
				await this.reciever.find({
					isRead,
					toUser: { id },
					take,
					skip: index * take,
				}),
				{ index, take },
			);
		return paginateResponse(
			this.reciever,
			await this.reciever.find({ toUser: { id }, take, skip: index * take }),
			{ take, index },
		);
	}
}
