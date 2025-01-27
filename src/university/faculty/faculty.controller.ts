import {
	Body,
	Controller,
	Injectable,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { MetaData } from 'auth/auth.guard';
import { memoryStorage } from 'multer';
import { IFacultyAssign } from './faculty.model';
import { Hook } from 'app/hook/hook.entity';
import { Request, Response } from 'express';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { AvatarFileUpload } from 'app/utils/controller.utils';

/**
 * Faculty controller
 */
@Injectable()
@Controller('faculty')
@UseInterceptors(CacheInterceptor)
export class FacultyController extends AppController {
	/**
	 * Initiate controller
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
	 * Assign faculty
	 */
	@Post('assign')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: Request,
		@Res() response: Response,
		@Body() body: IFacultyAssign,
		@MetaData() mtdt: string,
		@UploadedFile(AvatarFileUpload) avatar: Express.Multer.File,
	) {
		await this.svc.hook.validating(body.signature, mtdt, request.user as Hook);
		return this.responseWithUser(
			request,
			response,
			await this.svc.faculty.assign(body, avatar),
			mtdt,
		);
	}
}
