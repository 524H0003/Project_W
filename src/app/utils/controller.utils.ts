import { AppService } from 'app/app.service';
import { compare, hash } from './auth.utils';
import { IUserRecieve } from 'user/user.model';
import { User } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Base controller
 */
export class BaseController {
	/**
	 * Server access token secret
	 */
	private acsKey: string = this.cfg.get('ACCESS_SECRET');

	/**
	 * Server refresh token secret
	 */
	private rfsKey: string = this.cfg.get('REFRESH_SECRET');

	/**
	 * Initiate base controller
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {}

	/**
	 * Clear client's cookies
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {boolean} acs - if clear access token
	 * @param {boolean} rfs - if clear refresh token
	 */
	private async clearCookies(
		request: FastifyRequest,
		response: FastifyReply,
		acs: boolean = true,
		rfs: boolean = true,
	) {
		for (const cookie in request.cookies)
			if (
				((await compare(this.acsKey, cookie)) && acs) ||
				((await compare(this.rfsKey, cookie)) && rfs)
			)
				response.clearCookie(cookie);
	}

	/**
	 * Send client user's recieve infomations
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {IUserRecieve} usrRcv - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUserRecieve(
		request: FastifyRequest,
		response: FastifyReply,
		usrRcv: IUserRecieve,
	): Promise<void> {
		await this.clearCookies(request, response);

		const encryptedAccess = this.svc.auth.encrypt(usrRcv.accessToken),
			encryptedRefresh = this.svc.auth.encrypt(usrRcv.refreshToken);

		response
			.cookie(await hash(this.acsKey), encryptedAccess)
			.cookie(await hash(this.rfsKey), encryptedRefresh)
			.send({
				session: {
					access_token: encryptedAccess,
					refresh_token: encryptedRefresh,
					expires_in: usrRcv.payload.exp - usrRcv.payload.iat,
					expires_at: usrRcv.payload.exp,
				},
				user: typeof usrRcv.response !== 'string' ? usrRcv.response : undefined,
				message:
					typeof usrRcv.response === 'string' ? usrRcv.response : undefined,
			});
	}

	/**
	 * Send client user's recieve infomations
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} response - server's response
	 * @param {IUser} user - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUser(
		request: FastifyRequest,
		response: FastifyReply,
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

export const AvatarFileUpload = new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
	.addMaxSizeValidator({ maxSize: (0.3).mb2b })
	.build({
		fileIsRequired: false,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	});
