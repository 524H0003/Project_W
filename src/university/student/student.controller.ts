import {
	Body,
	Controller,
	Post,
	Req,
	Res,
	UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { MetaData } from 'auth/auth.guard';
import { ILogin } from 'user/user.model';
import { StudentService } from './student.service';
import { Request, Response } from 'express';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ConfigService } from '@nestjs/config';
import { HookService } from 'auth/hook/hook.service';

@Controller('student')
export class StudentController extends AuthController {
	constructor(
		private StuSvc: StudentService,
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
		@Body() body: ILogin,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		try {
			return this.sendBack(
				request,
				response,
				await this.StuSvc.login(body, mtdt),
			);
		} catch (error) {
			console.log(error);
		}
	}
}
