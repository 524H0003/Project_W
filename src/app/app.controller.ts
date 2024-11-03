import {
	BadRequestException,
	Body,
	Controller,
	HttpStatus,
	Param,
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
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { AuthController } from 'auth/auth.controller';
import { CurrentUser, MetaData } from 'auth/auth.guard';
import { AuthService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { Hook } from 'app/hook/hook.entity';
import { HookService } from 'app/hook/hook.service';
import { SessionService } from 'auth/session/session.service';
import { LocalHostStrategy } from 'auth/strategies/localhost.strategy';
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { StudentController } from 'university/student/student.controller';
import { IStudentSignup } from 'university/student/student.model';
import { IUserLogin, IUserSignUp } from 'user/user.model';

/**
 * Application Controller
 */
@Controller('')
export class AppController extends AuthController {
	/**
	 * @ignore
	 */
	constructor(
		private StuCon: StudentController,
		authSvc: AuthService,
		dvcSvc: DeviceService,
		sesSvc: SessionService,
		cfgSvc: ConfigService,
		hookSvc: HookService,
	) {
		super(authSvc, dvcSvc, sesSvc, cfgSvc, hookSvc);
	}

	/**
	 * Login request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IStudentSignup | IUserLogin} body - login input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('login')
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IStudentSignup | IUserLogin,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			return await this.StuCon.login(
				request,
				response,
				body as IStudentSignup,
				mtdt,
			);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'Invalid_Student_Email':
					throw new BadRequestException('Invalid_Email');

				default:
					throw error;
			}
		}
	}

	/**
	 * Sign up request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IUserSignUp} body - sign up input
	 * @param {string} mtdt - client's metadata
	 * @param {Express.Multer.File} avatar - user's avatar
	 * @return {Promise<void>}
	 */
	@Post('signup')
	@UseGuards(LocalHostStrategy)
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IUserSignUp,
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
		return super.signUp(request, response, body, mtdt, avatar);
	}

	/**
	 * Logout request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @return {Promise<void>}
	 */
	@Post('logout')
	@UseGuards(AuthGuard('refresh'))
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<void> {
		return super.logout(request, response);
	}

	/**
	 * Refreshing tokens request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('refresh')
	@UseGuards(AuthGuard('refresh'))
	refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		return super.refresh(request, response, mtdt);
	}

	/**
	 * Send signature to email
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('change')
	async requestViaEmail(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { email: string },
		@MetaData() mtdt: string,
	): Promise<void> {
		return super.requestViaEmail(request, response, body, mtdt);
	}

	/**
	 * Change password
	 * @param {string} signature - hook's signature
	 * @param {Response} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 * @return {Promise<void>}
	 */
	@Post('change/:token')
	@UseGuards(AuthGuard('hook'))
	changePassword(
		@Param('token') signature: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { password: string },
		@MetaData() mtdt: string,
		@CurrentUser() hook: Hook,
	): Promise<void> {
		return super.changePassword(signature, request, response, body, mtdt, hook);
	}

	/**
	 * Change password via console
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('console')
	protected async changePasswordViaConsole(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		return super.changePasswordViaConsole(request, response, mtdt);
	}
}
