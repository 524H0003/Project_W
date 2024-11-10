import {
	Body,
	Controller,
	forwardRef,
	HttpStatus,
	Inject,
	Param,
	ParseFilePipeBuilder,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { CurrentUser, MetaData } from 'auth/auth.guard';
import { Hook } from 'app/hook/hook.entity';
import { LocalHostStrategy } from 'auth/strategies/localhost.strategy';
import { CookieOptions, Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { IStudentSignup } from 'university/student/student.model';
import { IUserSignUp } from 'user/user.model';
import { IBaseUserEmail } from './app.model';
import { AppService } from './app.service';
import { User, UserRecieve } from 'user/user.entity';
import { compareSync } from 'bcrypt';
import { hash } from './utils/auth.utils';
import { IRefreshResult } from 'auth/strategies/refresh.strategy';

/**
 * Application Controller
 */
@Controller('')
export class AppController {
	/**
	 * @ignore
	 */
	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};

	/**
	 * @ignore
	 */
	constructor(
		@Inject(forwardRef(() => AppService))
		public svc: AppService,
	) {}

	/**
	 * @ignore
	 */
	private _acsKey: string;
	/**
	 * @ignore
	 */
	get acsKey(): string {
		if (this._acsKey) return this._acsKey;
		return (this._acsKey = this.svc.cfg.get('ACCESS_SECRET'));
	}

	/**
	 * @ignore
	 */
	private _rfsKey: string;
	/**
	 * @ignore
	 */
	get rfsKey(): string {
		if (this._rfsKey) return this._rfsKey;
		return (this._rfsKey = this.svc.cfg.get('REFRESH_SECRET'));
	}

	/**
	 * Clear client's cookies
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {boolean} acs - if clear access token
	 * @param {boolean} rfs - if clear refresh token
	 */
	private clearCookies(
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
	 * @return {void}
	 */
	protected responseWithUserRecieve(
		request: Request,
		response: Response,
		usrRcv: UserRecieve,
	): void {
		this.clearCookies(request, response);

		response
			.status(HttpStatus.ACCEPTED)
			.cookie(
				hash(this.acsKey),
				this.svc.auth.encrypt(
					usrRcv.accessToken,
					usrRcv.refreshToken.split('.')[2],
				),
				this.ckiOpt,
			)
			.cookie(
				hash(this.rfsKey),
				this.svc.auth.encrypt(usrRcv.refreshToken),
				this.ckiOpt,
			)
			.json({
				session: {
					access_token: usrRcv.accessToken,
					refresh_token: usrRcv.refreshToken,
					expires_in: usrRcv.payload.exp - usrRcv.payload.iat,
					expires_at: usrRcv.payload.exp,
				},
				user: usrRcv.response,
			});
	}

	/**
	 * Send client user's recieve infomations
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {User} user - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUser(
		request: Request,
		response: Response,
		user: User,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.sess.getTokens(user, mtdt),
		);
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
		@Body() body: IStudentSignup,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.stu.signUp(body);
		} catch (error) {
			switch ((error as { message: string }).message) {
				case 'Invalid_Student_Email':
					return this.responseWithUser(
						request,
						response,
						await this.svc.auth.login(body),
						mtdt,
					);
					break;

				case 'Request_New_User':
					return this.resetPasswordViaEmail(request, response, body, mtdt);
					break;

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
		return this.responseWithUser(
			request,
			response,
			await this.svc.auth.signUp(body, avatar || null),
			mtdt,
		);
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
		const rfsRsl = request.user as IRefreshResult;
		await this.svc.dvc.remove({
			id: (await this.svc.sess.id(rfsRsl.sessionId)).device.id,
		});
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'LogoutSuccess' }),
		);
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
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
				this.responseWithUserRecieve(request, response, usrRcv),
			rfsRsl = request.user as IRefreshResult;
		if (rfsRsl.status === 'lockdown') {
			await this.svc.dvc.remove({
				id: (await this.svc.sess.id(rfsRsl.sessionId)).device.id,
			});
			return sendBack(new UserRecieve({ response: 'LockdownAccount' }));
		} else {
			if (rfsRsl.status === 'success' && compareSync(mtdt, rfsRsl.userAgent)) {
				return sendBack(await this.svc.sess.rotateToken(rfsRsl.sessionId));
			} else return sendBack(await this.svc.sess.addTokens(rfsRsl.sessionId));
		}
	}

	/**
	 * Send signature to email
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('change-password')
	async resetPasswordViaEmail(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IBaseUserEmail,
		@MetaData() mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.hook.assign(
				mtdt,
				async (s: string) =>
					this.svc.mail.send(body.email, 'Change password?', 'forgetPassword', {
						name: (await this.svc.baseUser.email(body.email)).name,
						url: `${request.hostname}/hook/${s}`,
					}),
				'_Email',
			),
		);
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
	@Post('change-password/:token')
	@UseGuards(AuthGuard('hook'))
	async changePassword(
		@Param('token') signature: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { password: string },
		@MetaData() mtdt: string,
		@CurrentUser() hook: Hook,
	): Promise<void> {
		try {
			await this.svc.hook.validating(signature, mtdt, hook);
			if (await this.svc.auth.changePassword(hook.fromUser, body.password)) {
				return this.responseWithUserRecieve(
					request,
					response,
					new UserRecieve({ response: 'Success_Change_Password' }),
				);
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
	 * @return {Promise<void>}
	 */
	@Post('console')
	protected async requestSignatureViaConsole(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.hook.assign(
				mtdt,
				(s: string) => {
					console.log(
						`${'-'.repeat(75)}\nOne time signature: ${s}\n${'-'.repeat(75)}`,
					);
				},
				'_Console',
			),
		);
	}
}
