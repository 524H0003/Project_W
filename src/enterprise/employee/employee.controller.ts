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
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { MetaData } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';
import { Request, Response } from 'express';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from 'app/hook/hook.service';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { AuthGuard } from '@nestjs/passport';
import { Hook } from 'app/hook/hook.entity';
import { memoryStorage } from 'multer';
import { EmployeeService } from './employee.service';

/**
 * Employee controller
 */
@Controller('employee')
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
		private empSvc: EmployeeService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
	}

	/**
	 * Employee request hook
	 */
	@Post('hook')
	@UseInterceptors(NoFilesInterceptor())
	async hook(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEmployeeHook,
		@MetaData() mtdt: string,
	) {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.empSvc.hook(body, request.hostname, mtdt),
		);
	}

	/**
	 * Employee signup request
	 */
	@Post('signup')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
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
			return this.responseWithUser(
				request,
				response,
				(await this.empSvc.signUp(body, avatar, { role: UserRole.enterprise }))
					.user.user,
				mtdt,
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
