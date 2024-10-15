import {
	Body,
	Controller,
	Injectable,
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

/**
 * Student controller
 */
@Injectable()
@Controller('student')
export class StudentController extends AuthController {
	/**
	 * @ignore
	 */
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

	/**
	 * Student login request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {ILogin} body - the request context
	 * @param {string} mtdt - the client meta data
	 * @return {Promise<void>}
	 */
	@Post('login')
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: ILogin,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			return this.sendBack(
				request,
				response,
				await this.StuSvc.login(body, mtdt),
			);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'ERRNewUser':
					return this.requestViaEmail(request, response, body, mtdt);
					break;

				default:
					throw error;
					break;
			}
		}
	}
}
