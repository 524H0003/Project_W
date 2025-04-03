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
import { RequireOnlyOne } from 'app/utils/model.utils';

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
		@Body() { email }: RequireOnlyOne<StudentSignUp, 'email'>,
		@GetRequest('metaData') mtdt: MetaData,
		@GetRequest('hostname') hostname: string,
	): Promise<UserRecieve> {
		return this.resetPasswordViaEmail(
			hostname,
			(await this.svc.student.assign({ email })).user.baseUser,
			mtdt,
		);
	}
}
