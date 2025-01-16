import { AppService } from 'app/app.service';
import { CookieOptions, Request, Response } from 'express';
import { compare, hash } from './auth.utils';
import { IUserRecieve } from 'user/user.model';
import { User } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';

/**
 * Base controller
 */
export class BaseController {
	/**
	 * Global cookie options
	 */
	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};

	/**
	 * Access token secret
	 */
	private acsKey: string;

	/**
	 * Refresh token secret
	 */
	private rfsKey: string;

	/**
	 * Initiate controller
	 * @param {AppService} svc - general app service
	 * @param {ConfigService} cfg - general app config
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {
		this.acsKey = this.cfg.get('ACCESS_SECRET');
		this.rfsKey = this.cfg.get('REFRESH_SECRET');
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
				(compare(this.acsKey, cki) && acs) ||
				(compare(this.rfsKey, cki) && rfs)
			)
				response.clearCookie(cki, this.ckiOpt);
	}

	/**
	 * Send client user's recieve infomations
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IUserRecieve} usrRcv - user's recieve infomations
	 * @return {void}
	 */
	protected responseWithUserRecieve(
		request: Request,
		response: Response,
		usrRcv: IUserRecieve,
	): void {
		this.clearCookies(request, response);

		response
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
				user: typeof usrRcv.response !== 'string' ? usrRcv.response : '',
				message: typeof usrRcv.response === 'string' ? usrRcv.response : '',
			});
	}

	/**
	 * Send client user's recieve infomations
	 * @param {Request} request - client's request
	 * @param {Response} response - server's response
	 * @param {IUser} user - user's recieve infomations
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
			await this.svc.session.getTokens(user, mtdt),
		);
	}
}
