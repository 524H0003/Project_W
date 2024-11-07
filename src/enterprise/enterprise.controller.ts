import {
	Body,
	Controller,
	HttpStatus,
	ParseFilePipeBuilder,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { IEnterpriseAssign } from './enterprise.model';
import { MetaData } from 'auth/auth.guard';
import { Hook } from 'app/hook/hook.entity';
import { memoryStorage } from 'multer';
import { UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';

/**
 * Enterprise controller
 */
@Controller('enterprise')
export class EnterpriseController extends AppController {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {
		super(svc);
	}

	/**
	 * Assign enterprise request
	 */
	@Post('assign')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async assign(
		@Req() request: Request,
		@Res() response: Response,
		@Body() body: IEnterpriseAssign,
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
	): Promise<void> {
		await this.svc.hook.validating(body.signature, mtdt, request.user as Hook);
		await this.svc.ent.assign(body, avatar || null);
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'Success_Assign_Enterprise' }),
		);
	}
}
