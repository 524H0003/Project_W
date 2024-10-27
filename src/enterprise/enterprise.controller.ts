import {
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { Request, Response } from 'express';
import { IEnterpriseAssign } from './enterprise.model';
import { MetaData } from 'auth/auth.guard';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from 'auth/hook/hook.service';
import { Hook } from 'auth/hook/hook.entity';

/**
 * Enterprise controller
 */
@Controller('enterprise')
export class EnterpriseController extends AuthController {
	/**
	 * @ignore
	 */
	constructor(
		public authSvc: AuthService,
		dvcSvc: DeviceService,
		sesSvc: SessionService,
		cfgSvc: ConfigService,
		public hookSvc: HookService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
	}

	/**
	 * Assign enterprise request
	 */
	@Post('assign')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(NoFilesInterceptor())
	async assign(
		@Req() request: Request,
		@Res() response: Response,
		@Body() body: IEnterpriseAssign,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.hookSvc.validating(body.signature, mtdt, request.user as Hook);
			// return this.sendBack(
			// 	request, response,
			// )
		} catch (error) {}
	}
}
