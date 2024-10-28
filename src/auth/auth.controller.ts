import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { compareSync } from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';
import { UserRecieve } from 'user/user.class';
import { ILogin, ISignUp } from 'user/user.model';
import { AuthService } from './auth.service';
import { HookService } from './hook/hook.service';
import { Hook } from './hook/hook.entity';
import { hash } from 'app/utils/auth.utils';
import { IRefreshResult } from './strategies/refresh.strategy';
import { User } from 'user/user.entity';

/**
 * Auth controller
 */
export class AuthController {
	/**
	 * @ignore
	 */
	constructor(
		public authSvc: AuthService,
		public dvcSvc: DeviceService,
		private sesSvc: SessionService,
		private cfgSvc: ConfigService,
		public hookSvc: HookService,
	) {}

	/**
	 * @ignore
	 */
	private readonly acsKey = this.cfgSvc.get('ACCESS_SECRET');
	/**
	 * @ignore
	 */
	private readonly rfsKey = this.cfgSvc.get('REFRESH_SECRET');
	/**
	 * @ignore
	 */
	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};

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
	responseWithUserRecieve(
		request: Request,
		response: Response,
		usrRcv: UserRecieve,
	): void {
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
	async responseWithUser(
		request: Request,
		response: Response,
		user: User,
		mtdt: string,
	): Promise<void> {
		const usrRcv = await this.dvcSvc.getTokens(user, mtdt);

		return this.responseWithUserRecieve(request, response, usrRcv);
	}

	/**
	 * User login
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {ILogin} body - login input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	async login(
		request: Request,
		response: Response,
		body: ILogin,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUser(
			request,
			response,
			await this.authSvc.login(body),
			mtdt,
		);
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
	async signUp(
		request: Request,
		response: Response,
		body: ISignUp,
		mtdt: string,
		avatar: Express.Multer.File,
	): Promise<void> {
		return this.responseWithUser(
			request,
			response,
			await this.authSvc.signUp(body, avatar || null),
			mtdt,
		);
	}

	/**
	 * User logout
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @return {Promise<void>}
	 */
	async logout(request: Request, response: Response): Promise<void> {
		const rfsRsl = request.user as IRefreshResult;
		await this.dvcSvc.delete({
			id: (await this.sesSvc.id(rfsRsl.sessionId)).device.id,
		});
		return this.responseWithUserRecieve(
			request,
			response,
			new UserRecieve({ response: 'LogoutSuccess' }),
		);
	}

	/**
	 * User refreshing tokens
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<void>}
	 */
	async refresh(
		request: Request,
		response: Response,
		mtdt: string,
	): Promise<void> {
		const sendBack = (usrRcv: UserRecieve) =>
				this.responseWithUserRecieve(request, response, usrRcv),
			rfsRsl = request.user as IRefreshResult;
		if (rfsRsl.status === 'lockdown') {
			await this.dvcSvc.delete({
				id: (await this.sesSvc.id(rfsRsl.sessionId)).device.id,
			});
			return sendBack(new UserRecieve({ response: 'LockdownAccount' }));
		} else {
			if (rfsRsl.status === 'success' && compareSync(mtdt, rfsRsl.userAgent)) {
				return sendBack(await this.sesSvc.rotateToken(rfsRsl.sessionId));
			} else return sendBack(await this.sesSvc.addTokens(rfsRsl.sessionId));
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
	async requestViaEmail(
		request: Request,
		response: Response,
		body: { email: string },
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.hookSvc.assignViaEmail(body.email, request.hostname, mtdt),
		);
	}

	/**
	 * Change user password
	 * @param {string} signature - hook's signature
	 * @param {Response} response - server's response
	 * @param {object} body - request input
	 * @param {string} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 * @return {Promise<void>}
	 */
	async changePassword(
		signature: string,
		request: Request,
		response: Response,
		body: { password: string },
		mtdt: string,
		hook: Hook,
	): Promise<void> {
		try {
			await this.hookSvc.validating(signature, mtdt, hook);
			if (await this.authSvc.changePassword(hook.from, body.password)) {
				return this.responseWithUserRecieve(
					request,
					response,
					new UserRecieve({ response: 'ChangePasswordSuccess' }),
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
	protected async changePasswordViaConsole(
		request: Request,
		response: Response,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.hookSvc.assignViaConsole(mtdt),
		);
	}
}
