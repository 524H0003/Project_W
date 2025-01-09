import {
	Body,
	Controller,
	Injectable,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import { MetaData } from 'auth/auth.guard';
import { Request, Response } from 'express';
import { LocalHostStrategy } from 'auth/strategies/localhost.strategy';
import { IStudentSignup } from './student.model';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * Student controller
 */
@Injectable()
@Controller('student')
@UseInterceptors(CacheInterceptor)
export class StudentController extends AppController {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {
		super(svc);
	}

	/**
	 * Student login request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IStudentSignup} body - the request context
	 * @param {string} mtdt - the client meta data
	 * @return {Promise<void>}
	 */
	@Post('signup')
	@UseGuards(LocalHostStrategy)
	@UseInterceptors(NoFilesInterceptor())
	async signUp(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IStudentSignup,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'Request_New_User':
					return this.resetPasswordViaEmail(request, response, body, mtdt);

				default:
					throw error;
			}
		}
	}
}
