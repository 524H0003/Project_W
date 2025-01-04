import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
	Notification,
	NotificationAssign,
	NotificationUpdate,
} from './notification.entity';
import { BadRequestException, UseGuards } from '@nestjs/common';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';

@Resolver(() => Notification)
@UseGuards(RoleGuard)
export class NotificationResolver {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {}

	// Mutations
	/**
	 * Notification assign
	 */
	@Mutation(() => Notification)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async assignNotification(@Args('input') input: NotificationAssign) {
		return this.svc.noti.assign({ ...input });
	}

	/**
	 * Update notification
	 */
	@Mutation(() => Notification)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateNotification(@Args('input') input: NotificationUpdate) {
		const notification = await this.svc.noti.findOne({ id: input.id });

		if (!notification) throw new BadRequestException('Invalid_Notification_Id');

		return this.svc.noti.modify(notification.id, input);
	}
}
