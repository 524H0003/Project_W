import { AppService } from 'app/app.service';
import { compare, hash } from './auth.utils';
import { IUserRecieve } from 'user/user.model';
import { User, UserRecieve } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { BaseUserEmail } from 'app/app.dto';
import { UserAuthencation } from 'user/user.dto';
import { Hook } from 'app/hook/hook.entity';

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
				((await compare(this.acsKey, cookie, 'base64url')) && acs) ||
				((await compare(this.rfsKey + '!', cookie, 'base64url')) && rfs)
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

		if (accessToken)
			reply.cookie(await hash(this.acsKey, 'base64url'), encryptedAccess);
		if (refreshToken)
			reply.cookie(
				await hash(this.rfsKey + '!', 'base64url'),
				encryptedRefresh,
			);

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

	/**
	 * Send signature to email
	 */
	protected async resetPasswordViaEmail(
		request: FastifyRequest,
		response: FastifyReply,
		{ email }: BaseUserEmail,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			request,
			response,
			await this.svc.hook.assign(mtdt, async (s: string) => {
				const user = await this.svc.baseUser.email(email);

				if (!user) throw new ServerException('Invalid', 'Email', '', 'user');
				return this.svc.mail.send(email, 'Change password?', 'forgetPassword', {
					name: user.name,
					url: `${request.hostname}/hook/${s}`,
				});
			}),
		);
	}

	/**
	 * Change password
	 */
	protected async changePassword(
		signature: string,
		request: FastifyRequest,
		response: FastifyReply,
		{ password }: UserAuthencation,
		mtdt: string,
		hook: Hook,
	): Promise<void> {
		try {
			await this.svc.hook.validating(signature, mtdt, hook);

			const user = await this.svc.user.findOne({
				baseUser: { email: hook.fromBaseUser.email },
			});

			if (await this.svc.auth.changePassword(user, password)) {
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
}

export const AvatarFileUpload = new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
	.addMaxSizeValidator({ maxSize: (0.3).mb2b })
	.build({
		fileIsRequired: false,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	});
