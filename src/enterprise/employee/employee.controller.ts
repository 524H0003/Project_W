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
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { MetaData } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';
import { Request, Response } from 'express';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from 'auth/hook/hook.service';
import { IEmployeeSignup } from './employee.model';
import { AuthGuard } from '@nestjs/passport';
import { Hook } from 'auth/hook/hook.entity';

/**
 * Employee controller
 */
@Controller('enterprise')
export class EmployeeController extends AuthController {
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
	 * Employee signup request
	 */
	@Post('signup')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(NoFilesInterceptor())
	async signUp(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEmployeeSignup,
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
		try {
			await this.hookSvc.validating(body.signature, mtdt, request.user as Hook);
			return this.sendBack(
				request,
				response,
				await this.authSvc.signUp(body, mtdt, avatar, {
					role: UserRole.enterprise,
				}),
			);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'InvalidHook':
					return this.changePasswordViaConsole(request, response, mtdt);
					break;

				default:
					throw error;
					break;
			}
		}
	}
}
