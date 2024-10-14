import {
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
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { compareSync } from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { UserRecieve } from 'user/user.class';
import { ILogin, ISignUp } from 'user/user.model';
import { CurrentUser, MetaData } from './auth.guard';
import { AuthService } from './auth.service';
import { LocalHostStrategy } from './strategies/localhost.strategy';
import { HookService } from './hook/hook.service';
import { Hook } from './hook/hook.entity';
import { hash } from 'app/utils/auth.utils';

/**
 * Auth controller
 */
@Controller('')
export class AuthController {
	/**
	 * @ignore
	 */
	constructor(
		public authSvc: AuthService,
		private dvcSvc: DeviceService,
		private sesSvc: SessionService,
		private cfgSvc: ConfigService,
		public hookSvc: HookService,
	) {}

	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};
	private readonly rfsKey = this.cfgSvc.get('REFRESH_SECRET');
	private readonly acsKey = this.cfgSvc.get('ACCESS_SECRET');

	/**
	 * Clear client's cookies
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {boolean} acs - if clear access token
	 * @param {boolean} rfs - if clear refresh token
	 */
	protected clearCookies(
		request: Request,
		response: Response,
		acs: boolean = true,
		rfs: boolean = true,
	) {
		for (const cki in request.cookies)
			if (
				(compareSync(this.acsKey, cki) && acs) ||
				(compareSync(this.rfsKey, cki) && rfs)
			)
				response.clearCookie(cki, this.ckiOpt);
	}

	/**
	 * Send client user's recieve infomations
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {UserRecieve} usrRcv - user's recieve infomations
	 * @param {object} options - function's option
	 * @return {void}
	 */
	protected sendBack(
		request: Request,
		response: Response,
		usrRcv: UserRecieve,
		options?: { msg?: string },
	): void {
		const { msg = usrRcv.info } = options || {};
		this.clearCookies(request, response);
		response
			.status(HttpStatus.ACCEPTED)
			.cookie(
				hash(this.acsKey),
				this.authSvc.encrypt(
					usrRcv.accessToken,
					usrRcv.refreshToken.split('.')[2],
				),
				this.ckiOpt,
			)
			.cookie(
				hash(this.rfsKey),
				this.authSvc.encrypt(usrRcv.refreshToken),
				this.ckiOpt,
			)
			.json(msg);
	}

	/**
	 * User login
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {ILogin} body - login input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('login')
	@UseGuards(LocalHostStrategy)
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: ILogin,
		@MetaData() mtdt: string,
	): Promise<void> {
		this.sendBack(request, response, await this.authSvc.login(body, mtdt));
	}

	/**
	 * User sign up
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {ISignUp} body - sign up input
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
		@Body() body: ISignUp,
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
		return this.sendBack(
			request,
			response,
			await this.authSvc.signUp(body, mtdt, avatar || null),
		);
	}

	/**
	 * User logout
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
		await this.dvcSvc.remove(request.user['id']);
		return this.sendBack(request, response, UserRecieve.test);
	}

	/**
	 * User refreshing tokens
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('refresh')
	@UseGuards(AuthGuard('refresh'))
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
			this.sendBack(request, response, usrRcv);
		if (request.user['lockdown']) {
			await this.dvcSvc.remove(request.user['id']);
			return sendBack(UserRecieve.test);
		} else {
			if (request.user['success'] && compareSync(mtdt, request.user['ua'])) {
				return sendBack(
					new UserRecieve({
						accessToken: request.user['acsTkn'],
						refreshToken: request.user['rfsTkn'],
						info: request.user['usrInfo'],
					}),
				);
			} else return sendBack(await this.sesSvc.addTokens(request.user['id']));
		}
	}

	/**
	 * Send signature to email email
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
		return this.sendBack(
			request,
			response,
			await this.hookSvc.assignViaEmail(body.email, request.hostname, mtdt),
			{ msg: 'RequestSignatureFromEmail' },
		);
	}

	/**
	 * Change user password
	 * @param {string} signature - hook's signature
	 * @param {Response} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 */
	@Post('change/:token')
	@UseGuards(AuthGuard('hook'))
	async changePassword(
		@Param('token') signature: string,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { password: string },
		@MetaData() mtdt: string,
		@CurrentUser() hook: Hook,
	) {
		try {
			await this.hookSvc.validating(signature, mtdt, hook);
			if (await this.authSvc.changePassword(hook.from, body.password)) {
				response.send('Success');
			}
		} catch (error) {
			throw error;
		}
	}

	/**
	 * Change password via console
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 */
	@Post('console')
	protected async changePasswordViaConsole(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.hookSvc.assignViaConsole(request.hostname, mtdt),
			{ msg: 'RequestSignatureFromConsole' },
		);
	}
}
