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
import { IStudentSignup } from './student.model';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { FastifyReply, FastifyRequest } from 'fastify';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { LocalhostGuard } from 'auth/guards/localhost.guard';

/**
 * Student controller
 */
@Injectable()
@Controller('student')
@UseInterceptors(CacheInterceptor)
export class StudentController extends AppController {
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
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {IStudentSignup} body - the request context
	 * @param {string} mtdt - the client meta data
	 * @return {Promise<void>}
	 */
	@Post('signup')
	@UseGuards(LocalhostGuard)
	@UseInterceptors(FileInterceptor())
	async signUp(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: IStudentSignup,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case err('Success', 'User', 'SignUp'):
					return this.resetPasswordViaEmail(request, response, body, mtdt);

				default:
					throw error;
			}
		}
	}
}
