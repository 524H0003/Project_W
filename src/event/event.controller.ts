import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AppService } from 'app/app.service';
import { Request, Response } from 'express';
import { IEventInfo } from './event.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEventInfoKeys } from 'models';
import { BaseController } from 'app/utils/controller.utils';
import { User, UserRecieve } from 'user/user.entity';
import { CurrentUser, RoleGuard, Roles } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';

@Controller('event')
@UseGuards(RoleGuard)
export class EventController extends BaseController {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {
		super(svc);
	}

	/**
	 * Event assign
	 */
	@Post('assign')
	@Roles([UserRole.faculty, UserRole.enterprise])
	@UseInterceptors(NoFilesInterceptor())
	async assign(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEventInfo,
		@CurrentUser() user: User,
	) {
		body = InterfaceCasting.quick(body, IEventInfoKeys);

		await this.svc.event.assign({
			...body,
			eventCreatedBy: await this.svc.eventcreator.id(user.baseUser.id),
		});
		this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Event' }),
		);
	}

	/**
	 * Update event
	 */
	@Post('update')
	@Roles([UserRole.faculty, UserRole.enterprise])
	@UseInterceptors(NoFilesInterceptor())
	async updateStatus(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEventInfo,
		@CurrentUser() user: User,
	) {
		body = InterfaceCasting.quick(body, IEventInfoKeys);

		const event = await this.svc.event.findOne({
			eventCreatedBy: { user: { baseUser: { id: user.baseUser.id } } },
			id: body.id!,
		});

		if (!event) throw new BadRequestException('Invalid_Event_Id');
		await this.svc.event.modify(event.id, body);
		this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Update_Event' }),
		);
	}
}
