import {
	Body,
	Controller,
	Injectable,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AppService } from 'app/app.service';
import { FileInterceptor } from 'app/interceptor/file.interceptor';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { memoryStorage } from 'fastify-multer';
import { Hook } from 'app/hook/hook.entity';
import { FacultyAssign } from './faculty.dto';
import { GetRequest, HookGuard, MetaData } from 'auth/guards';
import { UserRole } from 'user/user.model';
import { UserRecieve } from 'user/user.entity';
import { AvatarFileUpload } from 'app/app.controller';
import { ApiSecurity } from '@nestjs/swagger';

/**
 * Faculty controller
 */
@Injectable()
@Controller({ version: '1', path: 'faculty' })
export class FacultyController {
	/**
	 * Initiate controller
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Assign faculty
	 */
	@ApiSecurity('CsrfToken')
	@Post('assign')
	@UseGuards(HookGuard)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Body() { signature, department, password, ...body }: FacultyAssign,
		@GetRequest('metaData') mtdt: MetaData,
		@UploadedFile(AvatarFileUpload) avatar: MulterFile,
		@GetRequest('hook') hook: Hook,
	) {
		await this.svc.hook.validating(signature, mtdt, hook);

		const faculty = await this.svc.faculty.assign(
				{
					eventCreator: {
						user: { baseUser: body, password, role: UserRole['faculty'] },
					},
					department,
				},
				avatar,
			),
			{ id, hash } = await this.svc.bloc.assign(faculty.eventCreator.user, {
				mtdt,
			});

		return new UserRecieve({
			blocInfo: { id, hash },
			response: await this.svc.user.info(faculty.id),
		});
	}
}
