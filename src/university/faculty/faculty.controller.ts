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
import { MetaData } from 'auth/guards/access.guard';
import { IFacultyAssign } from './faculty.model';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { memoryStorage } from 'fastify-multer';
import { HookGuard } from 'auth/guards/hook.guard';

/**
 * Faculty controller
 */
@Injectable()
@Controller({ version: '1', path: 'faculty' })
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
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: FastifyRequest,
		@Res() response: FastifyReply,
		@Body() { signature, ...body }: IFacultyAssign & { signature: string },
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	) {
		await this.svc.hook.validating(signature, mtdt, request.hook);

		return this.responseWithUser(
			request,
			response,
			await this.svc.faculty.assign(body, avatar),
			mtdt,
		);
	}
}
