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
import { MetaData } from 'auth/guards/access.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
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
 * Employee controller
 */
@Controller('employee')
@UseInterceptors(CacheInterceptor)
export class EmployeeController extends AppController {
	/**
	 * Initiate employee controller
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
	 * Employee request hook
	 */
	@Post('hook') @UseInterceptors(FileInterceptor()) async employeeHook(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: IEmployeeHook,
		@MetaData() mtdt: string,
	) {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.employee.hook(body, request.hostname, mtdt),
		);
	}

	/**
	 * Employee signup request
	 */
	@Post('signup')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() body: IEmployeeSignup,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
	): Promise<void> {
		await this.svc.hook.validating(body.signature, mtdt, request.hook);
		return this.responseWithUser(
			request,
			response,
			(
				await this.svc.employee.assign(
					{
						...body,
						enterpriseId: JSON.parse(request.hook.note).enterpriseId,
					},
					avatar,
				)
			).eventCreator.user,
			mtdt,
		);
	}
}
