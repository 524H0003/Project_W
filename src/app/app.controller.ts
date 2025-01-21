import {
	Body,
	Controller,
	forwardRef,
	Inject,
	Param,
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
import { Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { IStudentSignup } from 'university/student/student.model';
import { IUserSignUp } from 'user/user.model';
import { IBaseUserEmail } from './app.model';
import { AppService } from './app.service';
import { UserRecieve } from 'user/user.entity';
import { compare } from './utils/auth.utils';
import { IRefreshResult } from 'auth/strategies/refresh.strategy';
import { Throttle } from '@nestjs/throttler';
import { AvatarFileUpload, BaseController } from './utils/controller.utils';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

/**
 * Application Controller
 */
@Controller('')
@UseInterceptors(CacheInterceptor)
export class AppController extends BaseController {
	/**
	 * @ignore
	 */
	constructor(
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
		protected cfg: ConfigService,
	) {
		super(svc, cfg);
	}

	/**
	 * Login request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IStudentSignup} body - login input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('login') @UseInterceptors(NoFilesInterceptor()) async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: IStudentSignup,
		@MetaData() mtdt: string,
	): Promise<void> {
		try {
			await this.svc.student.signUp(body);
		} catch (error) {
			switch ((error as ServerException).message) {
				case err('Invalid', 'User', 'SignUp'):
					return this.responseWithUser(
						request,
						response,
						await this.svc.auth.login(body),
						mtdt,
					);

				case err('Success', 'User', 'SignUp'):
					return this.resetPasswordViaEmail(request, response, body, mtdt);

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
		@UploadedFile(AvatarFileUpload) avatar: Express.Multer.File,
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
	@Post('logout') @UseGuards(AuthGuard('refresh')) async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	): Promise<void> {
		const rfsRsl = request.user as IRefreshResult;
		await this.svc.device.remove({
			id: (await this.svc.session.id(rfsRsl.sessionId)).device.id,
		});
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: err('Success', 'User', 'LogOut') }),
		);
	}

	/**
	 * Refreshing tokens request
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	@Post('refresh') @UseGuards(AuthGuard('refresh')) async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
				this.responseWithUserRecieve(request, response, usrRcv),
			rfsRsl = request.user as IRefreshResult;
		if (rfsRsl.status === 'lockdown') {
			await this.svc.device.remove({
				id: (await this.svc.session.id(rfsRsl.sessionId)).device.id,
			});
			return sendBack(new UserRecieve({ response: 'LockdownAccount' }));
		} else {
			if (
				rfsRsl.status === 'success' &&
				compare(mtdt, rfsRsl.hashedUserAgent)
			) {
				return sendBack(await this.svc.session.rotateToken(rfsRsl.sessionId));
			} else
				return sendBack(await this.svc.session.addTokens(rfsRsl.sessionId));
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
	@Throttle({ default: { limit: 1, ttl: 300000 } })
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
			await this.svc.hook.assign(mtdt, async (s: string) => {
				const user = await this.svc.baseUser.email(body.email);

				if (!user) throw new ServerException('Invalid', 'Email', '', 'user');
				return this.svc.mail.send(
					body.email,
					'Change password?',
					'forgetPassword',
					{ name: user.name, url: `${request.hostname}/hook/${s}` },
				);
			}),
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
	@Throttle({ default: { limit: 3, ttl: 240000 } })
	@Post('change-password/:token')
	@UseGuards(AuthGuard('hook'))
	async changePassword(
		@Param('token') signature: string,
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { password: string },
		@MetaData() mtdt: string,
		@CurrentUser({ instance: Hook }) hook: Hook,
	): Promise<void> {
		try {
			await this.svc.hook.validating(signature, mtdt, hook);

			const user = await this.svc.user.findOne({
				baseUser: { email: hook.fromBaseUser.email },
			});

			if (await this.svc.auth.changePassword(user, body.password)) {
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
	@Throttle({ default: { limit: 1, ttl: 600000 } })
	@Post('request-signature')
	protected async requestSignatureViaConsole(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.hook.assign(mtdt, (signature: string) =>
				this.svc.mail.send(
					this.svc.cfg.get('ADMIN_EMAIL'),
					'Signature request',
					'sendSignatureAdmin',
					{ signature },
				),
			),
		);
	}
}
