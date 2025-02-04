import {
	Body,
	Controller,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IEnterpriseAssign } from './enterprise.model';
import { MetaData } from 'auth/guards/access.guard';
import { UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards/hook.guard';

/**
 * Enterprise controller
 */
@Controller('enterprise')
@UseInterceptors(CacheInterceptor)
export class EnterpriseController extends AppController {
	/**
	 * Initiate enterprise controller
	 * @param {AppService} svc - general app service
	 * @param {ConfigService} cfg - general app config
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
		@Req() request: FastifyRequest,
		@Res() response: FastifyReply,
		@Body() { signature, ...body }: IEnterpriseAssign & { signature: string },
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<void> {
		await this.svc.hook.validating(signature, mtdt, request.hook);
		await this.svc.enterprise.assign(body, avatar);
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Enterprise' }),
		);
	}
}
