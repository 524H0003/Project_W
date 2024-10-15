import {
	BadRequestException,
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { MetaData } from 'auth/auth.guard';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { HookService } from 'auth/hook/hook.service';
import { SessionService } from 'auth/session/session.service';
import { Request, Response } from 'express';
import { StudentController } from 'university/student/student.controller';
import { ILogin } from 'user/user.model';

@Controller('')
export class AppController extends AuthController {
	/**
	 * @ignore
	 */
	constructor(
		private StuCon: StudentController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		sesSvc: SessionService,
		cfgSvc: ConfigService,
		hookSvc: HookService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
	}

	@Post('login')
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: ILogin,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			return this.StuCon.login(request, response, body, mtdt);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'InvalidStudentEmail':
					throw new BadRequestException('InvalidUserRequest');
					break;

				default:
					throw error;
					break;
			}
		}
	}
}
