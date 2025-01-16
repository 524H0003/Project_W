import { Field, InputType } from '@nestjs/graphql';
import { INotificationInfo, NotificationType } from './notification.model';

@InputType()
export class NotificationAssign implements INotificationInfo {
	@Field() title: string;
	@Field() content: string;
	@Field() type: NotificationType;
}

@InputType()
export class NotificationUpdate implements INotificationInfo {
	@Field({ nullable: true }) title: string;
	@Field({ nullable: true }) content: string;
	@Field({ nullable: true }) type: NotificationType;
	@Field() id: string;
}
