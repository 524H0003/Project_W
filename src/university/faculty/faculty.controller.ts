import {
	Body,
	Controller,
	Injectable,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetaData } from 'auth/auth.guard';
import { IFacultyAssign } from './faculty.model';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { File } from 'fastify-multer/lib/interfaces';
import { memoryStorage } from 'fastify-multer';

/**
 * Faculty controller
 */
@Injectable()
@Controller('faculty')
@UseInterceptors(CacheInterceptor)
export class FacultyController extends AppController {
	/**
	 * Initiate controller
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {
		super(svc, cfg);
	}

	/**
	 * Assign faculty
	 */
	@Post('assign')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: FastifyRequest,
		@Res() response: FastifyReply,
		@Body() body: IFacultyAssign,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: File,
	) {
		await this.svc.hook.validating(body.signature, mtdt, request.hook);
		return this.responseWithUser(
			request,
			response,
			await this.svc.faculty.assign(body, avatar),
			mtdt,
		);
	}
}
