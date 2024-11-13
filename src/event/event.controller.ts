import {
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AppService } from 'app/app.service';
import { Request, Response } from 'express';
import { IEventInfo } from './event.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEventInfoKeys } from 'models';
import { BaseController } from 'app/utils/controller.utils';
import { UserRecieve } from 'user/user.entity';
import { Roles } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';

@Controller('event')
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
	) {
		body = InterfaceCasting.quick(body, IEventInfoKeys);

		await this.svc.event.assign(body);
		this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Event' }),
		);
	}
}
