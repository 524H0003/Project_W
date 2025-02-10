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
import { MetaData } from 'auth/guards/access.guard';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { LocalhostGuard } from 'auth/guards/localhost.guard';
import { BaseController } from 'app/utils/controller.utils';
import { StudentSignUp } from './student.dto';

/**
 * Student controller
 */
@Injectable()
@Controller({ version: '1', path: 'student' })
@UseInterceptors(CacheInterceptor)
export class StudentController extends BaseController {
	/**
	 * Initiate student controller
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {
		super(svc, cfg);
	}

	/**
	 * Student login request
	 */
	@Post('sign-up')
	@UseGuards(LocalhostGuard)
	@UseInterceptors(FileInterceptor())
	async signUp(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: StudentSignUp,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			const { message } = error as ServerException;
			switch (true) {
				case message.includes(err('Success', 'User', 'SignUp')):
					return this.resetPasswordViaEmail(request, response, body, mtdt);

				default:
					throw error;
			}
		}
	}
}
