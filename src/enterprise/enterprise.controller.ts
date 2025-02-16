import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload, BaseController } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards';
import { EnterpriseAssign } from './enterprise.dto';
import { Hook } from 'app/hook/hook.entity';
import { GetMetaData, GetRequest, MetaData } from 'auth/guards';

/**
 * Enterprise controller
 */
@Controller({ version: '1', path: 'enterprise' })
@UseInterceptors(CacheInterceptor)
export class EnterpriseController extends BaseController {
	/**
	 * Initiate enterprise controller
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {
		super(svc, cfg);
	}

	/**
	 * Assign enterprise request
	 */
	@Post('assign')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Body() { signature, ...body }: EnterpriseAssign,
		@GetMetaData() mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		await this.svc.hook.validating(signature, mtdt, hook);
		await this.svc.enterprise.assign(body, avatar);
		return new UserRecieve({ response: 'Success_Assign_Enterprise' });
	}
}
