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
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { MetaData } from 'auth/auth.guard';
import { UserRole } from 'user/user.model';
import { Request, Response } from 'express';
import { IEmployeeHook, IEmployeeSignup } from './employee.model';
import { AuthGuard } from '@nestjs/passport';
import { Hook } from 'app/hook/hook.entity';
import { memoryStorage } from 'multer';
import { AppService } from 'app/app.service';
import { AppController } from 'app/app.controller';

/**
 * Employee controller
 */
@Controller('employee')
export class EmployeeController extends AppController {
	/**
	 * @ignore
	 */
	constructor(public svc: AppService) {
		super(svc);
	}

	/**
	 * Employee request hook
	 */
	@Post('hook')
	@UseInterceptors(NoFilesInterceptor())
	async employeeHook(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEmployeeHook,
		@MetaData() mtdt: string,
	) {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.emp.hook(body, request.hostname, mtdt),
		);
	}

	/**
	 * Employee signup request
	 */
	@Post('signup')
	@UseGuards(AuthGuard('hook'))
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IEmployeeSignup,
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
		try {
			await this.svc.hook.validating(
				body.signature,
				mtdt,
				request.user as Hook,
			);
			return this.responseWithUser(
				request,
				response,
				(
					await this.svc.emp.signUp(
						body,
						avatar,
						JSON.parse((request.user as Hook).note).enterpriseName,
						{ role: UserRole.enterprise },
					)
				).eventCreator.user,
				mtdt,
			);
		} catch (error) {
			switch ((error as { message: string }).message) {
				default:
					throw error;
					break;
			}
		}
	}
}
