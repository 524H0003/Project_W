import {
	Body,
	Controller,
	Injectable,
	Post,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload, BaseController } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { memoryStorage } from 'fastify-multer';
import { Hook } from 'app/hook/hook.entity';
import { FacultyAssign } from './faculty.dto';
import { GetMetaData, GetRequest, HookGuard, MetaData } from 'auth/guards';

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
		@Res() response: FastifyReply,
		@Body() { signature, ...body }: FacultyAssign,
		@GetMetaData() mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	) {
		await this.svc.hook.validating(signature, mtdt, hook);

		return this.responseWithUser(
			response,
			(await this.svc.faculty.assign(body, avatar)).eventCreator.user,
			mtdt,
		);
	}
}
