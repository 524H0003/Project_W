import {
	Body,
	Controller,
	HttpStatus,
	Injectable,
	ParseFilePipeBuilder,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { HookService } from 'app/hook/hook.service';
import { AuthController } from 'auth/auth.controller';
import { MetaData } from 'auth/auth.guard';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { memoryStorage } from 'multer';
import { IFacultyAssign } from './faculty.model';
import { Hook } from 'app/hook/hook.entity';
import { Request, Response } from 'express';
import { FacultyService } from './faculty.service';

/**
 * Faculty controller
 */
@Injectable()
@Controller('faculty')
export class FacultyController extends AuthController {
	/**
	 * @ignore
	 */
	constructor(
		authSvc: AuthService,
		dvcSvc: DeviceService,
		sesSvc: SessionService,
		cfgSvc: ConfigService,
		hookSvc: HookService,
		private facSvc: FacultyService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
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
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
				.addMaxSizeValidator({ maxSize: (0.3).mb })
				.build({
					fileIsRequired: false,
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		avatar: Express.Multer.File,
	) {
		await this.hookSvc.validating(body.signature, mtdt, request.user as Hook);
		return this.responseWithUser(
			request,
			response,
			await this.facSvc.assign(body, avatar),
			mtdt,
		);
	}
}
