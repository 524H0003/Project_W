import {
	Body,
	Controller,
	Injectable,
	Post,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { GetRequest, LocalhostGuard, MetaData } from 'auth/guards';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { BaseController } from 'app/utils/controller.utils';
import { StudentSignUp } from './student.dto';
import { UserRecieve } from 'user/user.entity';

/**
 * Student controller
 */
@Injectable()
@Controller({ version: '1', path: 'student' })
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
		@Body() body: StudentSignUp,
		@GetRequest('metaData') mtdt: MetaData,
		@GetRequest('hostname') hostname: string,
	): Promise<UserRecieve> {
		try {
			await this.svc.student.assign(body);
		} catch (error) {
			const { message } = error as ServerException;
			switch (true) {
				case message.includes(err('Success', 'User', 'SignUp')):
					return this.resetPasswordViaEmail(hostname, body, mtdt);

				default:
					throw error;
			}
		}
	}
}
