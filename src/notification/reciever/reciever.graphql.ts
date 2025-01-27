import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RecieverAssign {
	@Field() notificationId: string;
	@Field() userId: string;
}

@InputType()
export class RecieverAssignMany {
	@Field() notificationId: string;
	@Field(() => [String]) usersId: string[];
}

@InputType()
export class ReadNotification {
	@Field() recieverId: string;
}

@InputType()
export class ReadNotificationMany {
	@Field(() => [String]) recieversId: string[];
}
