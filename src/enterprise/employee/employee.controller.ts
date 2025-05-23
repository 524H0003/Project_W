import {
	Body,
	Controller,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AppService } from 'app/app.service';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import type { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards';
import { EmployeeHook, EmployeeSignUp } from './employee.dto';
import { Hook } from 'app/hook/hook.entity';
import { IEmployeeSignUp } from './employee.model';
import { GetRequest, type MetaData } from 'auth/guards';
import { UserRecieve } from 'user/user.entity';
import { AvatarFileUpload } from 'app/app.controller';
import { ApiSecurity } from '@nestjs/swagger';

/**
 * Employee controller
 */
@Controller({ version: '1', path: 'employee' })
export class EmployeeController {
	/**
	 * Initiate employee controller
	 * @param {AppService} svc - general app service
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Employee request hook
	 */
	@ApiSecurity('CsrfToken')
	@Post('hook')
	@UseInterceptors(FileInterceptor())
	async employeeHook(
		@Body() body: EmployeeHook,
		@GetRequest('metaData') mtdt: MetaData,
	) {
		const { id } = await this.svc.employee.hook(body, mtdt);

		return new UserRecieve({
			HookId: id,
			response: { message: err('Success', 'Signature', 'Sent') },
		});
	}

	/**
	 * Employee sign up request
	 */
	@ApiSecurity('CsrfToken')
	@Post('sign-up')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Body() { signature, password }: EmployeeSignUp,
		@GetRequest('metaData') mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		await this.svc.hook.validating(signature, mtdt, hook);

		const employee = await this.svc.employee.assign(
				{ password, ...hook.note } as IEmployeeSignUp,
				avatar,
			),
			{ id, hash } = await this.svc.bloc.assign(employee.eventCreator.user, {
				mtdt,
			});

		return new UserRecieve({
			blocInfo: { id, hash },
			response: await this.svc.user.info(employee.id),
		});
	}
}
