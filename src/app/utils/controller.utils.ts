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
				((await compare(this.acsKey, cookie)) && rfs)
			)
				response.clearCookie(cookie);
	}

	/**
	 * Send client user's recieve infomations
	 * @param {FastifyRequest} request - client's request
	 * @param {FastifyReply} reply - server's response
	 * @param {IUserRecieve} usrRcv - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUserRecieve(
		request: FastifyRequest,
		reply: FastifyReply,
		{ accessToken, refreshToken, payload, response }: IUserRecieve,
	): Promise<void> {
		await this.clearCookies(request, reply);

		const encryptedAccess = this.svc.auth.encrypt(accessToken),
			encryptedRefresh = this.svc.auth.encrypt(refreshToken);

		if (accessToken) reply.cookie(await hash(this.acsKey), encryptedAccess);
		if (refreshToken) reply.cookie(await hash(this.rfsKey), encryptedRefresh);

		reply.send({
			session: {
				access_token: accessToken ? encryptedAccess : undefined,
				refresh_token: refreshToken ? encryptedRefresh : undefined,
				expires_in: payload.exp - payload.iat,
				expires_at: payload.exp,
			},
			user: typeof response !== 'string' ? response : undefined,
			message: typeof response === 'string' ? response : undefined,
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
