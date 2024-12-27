import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
	ReadNotification,
	ReadNotificationMany,
	Reciever,
	RecieverAssign,
	RecieverAssignMany,
} from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { User } from 'user/user.entity';

@Resolver(() => Reciever)
@UseGuards(RoleGuard)
export class RecieverResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

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
	async readNotification(
		@Args('input') input: ReadNotification,
		@CurrentUser() usr: User,
	) {
		return this.svc.recie.read(input.recieverId, usr.baseUser.id);
	}

	/**
	 * Read many notifications
	 */
	@Mutation(() => [Reciever])
	@Roles([UserRole.student])
	async readNotificationMany(
		@Args('input') input: ReadNotificationMany,
		@CurrentUser() usr: User,
	) {
		return this.svc.recie.readMany(input.recieversId, usr.baseUser.id);
	}
}
