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
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { MetaData } from 'auth/auth.guard';
import { memoryStorage } from 'multer';
import { IFacultyAssign } from './faculty.model';
import { Hook } from 'app/hook/hook.entity';
import { Request, Response } from 'express';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';

/**
 * Faculty controller
 */
@Injectable()
@Controller('faculty')
export class FacultyController extends AppController {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {
		super(svc);
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
		await this.svc.hook.validating(body.signature, mtdt, request.user as Hook);
		return this.responseWithUser(
			request,
			response,
			await this.svc.fac.assign(body, avatar),
			mtdt,
		);
	}
}
