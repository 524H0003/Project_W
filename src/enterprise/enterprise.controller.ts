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
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { memoryStorage } from 'fastify-multer';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { HookGuard } from 'auth/guards';
import { EnterpriseAssign } from './enterprise.dto';
import { Hook } from 'app/hook/hook.entity';
import { GetRequest, MetaData } from 'auth/guards';
import { AvatarFileUpload } from 'app/app.controller';

/**
 * Enterprise controller
 */
@Controller({ version: '1', path: 'enterprise' })
export class EnterpriseController {
	/**
	 * Initiate enterprise controller
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Assign enterprise request
	 */
	@Post('assign')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Body() { signature, ...body }: EnterpriseAssign,
		@GetRequest('metaData') mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	): Promise<UserRecieve> {
		await this.svc.hook.validating(signature, mtdt, hook);
		await this.svc.enterprise.assign(body, avatar);
		return new UserRecieve({
			isClearCookie: true,
			response: { message: err('Success', 'Enterprise', 'Assign') },
		});
	}
}
