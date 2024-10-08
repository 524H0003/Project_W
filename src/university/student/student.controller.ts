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

@Controller('student')
export class StudentController extends AuthController {
	constructor(
		private StuSvc: StudentService,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		sesSvc: SessionService,
		cfgSvc: ConfigService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc);
	}

	@Post('login')
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Body() body: ILogin,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.StuSvc.login(body, mtdt),
		);
	}
}
