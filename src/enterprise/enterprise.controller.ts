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
import { AuthGuard } from '@nestjs/passport';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IEnterpriseAssign } from './enterprise.model';
import { MetaData } from 'auth/auth.guard';
import { Hook } from 'app/hook/hook.entity';
import { memoryStorage } from 'multer';
import { UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';

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
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: FastifyRequest,
		@Res() response: FastifyReply,
		@Body() body: IEnterpriseAssign,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: Express.Multer.File,
	): Promise<void> {
		await this.svc.hook.validating(body.signature, mtdt, request.hook);
		await this.svc.enterprise.assign(body, avatar || null);
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Enterprise' }),
		);
	}
}
