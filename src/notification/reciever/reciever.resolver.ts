import { Args, Mutation, Resolver } from '@nestjs/graphql';
import {
	Reciever,
	RecieverAssign,
	RecieverAssignMany,
} from './reciever.entity';
import { UseGuards } from '@nestjs/common';
import { RoleGuard, Roles } from 'auth/auth.guard';
import { AppService } from 'app/app.service';
import { UserRole } from 'user/user.model';

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
}