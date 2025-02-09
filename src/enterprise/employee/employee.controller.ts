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
import { GetRequest, MetaData } from 'auth/guards/access.guard';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload, BaseController } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards/hook.guard';
import { EmployeeHook, EmployeeSignUp } from './employee.dto';
import { Hook } from 'app/hook/hook.entity';
import { IEmployeeSignUp } from './employee.model';

/**
 * Employee controller
 */
@Controller({ version: '1', path: 'employee' })
@UseInterceptors(CacheInterceptor)
export class EmployeeController extends BaseController {
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
		@Body() body: EmployeeHook,
		@MetaData() mtdt: string,
	) {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.employee.hook(body, mtdt),
		);
	}

	/**
	 * Employee sign up request
	 */
	@Post('sign-up')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Req() request: FastifyRequest,
		@Res({ passthrough: true }) response: FastifyReply,
		@Body() { signature, password }: EmployeeSignUp,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	): Promise<void> {
		await this.svc.hook.validating(signature, mtdt, hook);

		const { user } = (
			await this.svc.employee.assign(
				{ password, ...hook.note } as unknown as IEmployeeSignUp & {
					enterpriseId: string;
				},
				avatar,
			)
		).eventCreator;

		return this.responseWithUser(request, response, user, mtdt);
	}
}
