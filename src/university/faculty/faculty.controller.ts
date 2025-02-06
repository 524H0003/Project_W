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
import { GetRequest, MetaData } from 'auth/guards/access.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload, BaseController } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { memoryStorage } from 'fastify-multer';
import { HookGuard } from 'auth/guards/hook.guard';
import { Hook } from 'app/hook/hook.entity';
import { FacultyAssign } from './faculty.dto';

/**
 * Faculty controller
 */
@Injectable()
@Controller({ version: '1', path: 'faculty' })
@UseInterceptors(CacheInterceptor)
export class FacultyController extends BaseController {
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
		@Body() { signature, ...body }: FacultyAssign,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	) {
		await this.svc.hook.validating(signature, mtdt, hook);

		return this.responseWithUser(
			request,
			response,
			await this.svc.faculty.assign(body, avatar),
			mtdt,
		);
	}
}
