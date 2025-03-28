import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Notification } from './notification.entity';
import { UseGuards } from '@nestjs/common';
import { AccessGuard, Allow } from 'auth/guards';
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
	@Allow([UserRole.faculty, UserRole.enterprise])
	assignNotification(@Args('input') input: NotificationAssign) {
		return this.svc.notification.assign({ ...input });
	}

	/**
	 * Update notification
	 */
	@Mutation(() => Notification)
	@Allow([UserRole.faculty, UserRole.enterprise])
	async updateNotification(@Args('input') input: NotificationUpdate) {
		const notification = await this.svc.notification.findOne({ id: input.id });

		if (notification.isNull())
			throw new ServerException('Invalid', 'Notification', '');

		await this.svc.notification.modify(notification.id, input);

		return this.svc.notification.id(notification.id, { cache: false });
	}
}
