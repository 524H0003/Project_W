import {
	Body,
	Controller,
	HttpStatus,
	ParseFilePipeBuilder,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { Request, Response } from 'express';
import { IEnterpriseAssign } from './enterprise.model';
import { MetaData } from 'auth/auth.guard';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from 'app/hook/hook.service';
import { Hook } from 'app/hook/hook.entity';
import { EnterpriseService } from './enterprise.service';
import { memoryStorage } from 'multer';
import { IBaseUser } from 'app/app.model';
import { UserRecieve } from 'user/user.entity';

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
		private entSvc: EnterpriseService,
		public hookSvc: HookService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
	}

	/**
	 * Assign enterprise request
	 */
	@Post('assign')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: Request,
		@Res() response: Response,
		@Body() body: IEnterpriseAssign & IBaseUser,
		@MetaData() mtdt: string,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
				.addMaxSizeValidator({ maxSize: (0.3).mb })
				.build({
					fileIsRequired: false,
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		avatar: Express.Multer.File,
	): Promise<void> {
		await this.hookSvc.validating(body.signature, mtdt, request.user as Hook);
		await this.entSvc.assign(body, avatar || null);
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Enterprise' }),
		);
	}
}
