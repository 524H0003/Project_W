import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Notification } from './notification.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Roles } from 'auth/guards/access.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';
import { NotificationAssign, NotificationUpdate } from './notification.graphql';

@Resolver(() => Notification)
@UseGuards(AccessGuard)
export class NotificationResolver {
	/**
	 * Initiate notification resolver
	 */
	constructor(protected svc: AppService) {}

	// Mutations
	/**
	 * Notification assign
	 */
	@Mutation(() => Notification)
	@Roles([UserRole.faculty, UserRole.enterprise])
	assignNotification(@Args('input') input: NotificationAssign) {
		return this.svc.notification.assign({ ...input });
	}

	/**
	 * Update notification
	 */
	@Mutation(() => Notification)
	@Roles([UserRole.faculty, UserRole.enterprise])
	async updateNotification(@Args('input') input: NotificationUpdate) {
		const notification = await this.svc.notification.findOne({ id: input.id });

		if (!notification)
			throw new ServerException('Invalid', 'Notification', '', 'user');

		return this.svc.notification.modify(notification.id, input);
	}
}
