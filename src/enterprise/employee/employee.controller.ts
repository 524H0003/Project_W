import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload, BaseController } from 'app/utils/controller.utils';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards';
import { EmployeeHook, EmployeeSignUp } from './employee.dto';
import { Hook } from 'app/hook/hook.entity';
import { IEmployeeSignUp } from './employee.model';
import { GetMetaData, GetRequest, MetaData } from 'auth/guards';
import { UserRecieve } from 'user/user.entity';

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
		@Body() body: EmployeeHook,
		@GetMetaData() mtdt: MetaData,
	) {
		const { id } = await this.svc.employee.hook(body, mtdt);

		return new UserRecieve({
			accessToken: id,
			response: { message: err('Success', 'Signature', 'Sent') },
		});
	}

	/**
	 * Employee sign up request
	 */
	@Post('sign-up')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Body() { signature, password }: EmployeeSignUp,
		@GetMetaData() mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		await this.svc.hook.validating(signature, mtdt, hook);

		const { id } = await this.svc.employee.assign(
			{ password, ...hook.note } as IEmployeeSignUp,
			avatar,
		);

		return this.svc.bloc.getTokens(id, mtdt);
	}
}
