import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { PaginateResult } from 'app/graphql/graphql.dto';
import { Reciever } from './reciever.entity';

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

@ObjectType()
export class RecieverPage extends PaginateResult(Reciever) {}
