import { AppService } from 'app/app.service';
import { hash } from './auth.utils';
import { IUserRecieve } from 'user/user.model';
import { User, UserRecieve } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { FastifyReply } from 'fastify';
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
	 * Send client user's recieve infomations
	 * @param {FastifyReply} reply - server's response
	 * @param {IUserRecieve} usrRcv - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUserRecieve(
		reply: FastifyReply,
		{ accessToken, refreshToken, response }: IUserRecieve,
	): Promise<void> {
		const encryptedAccess = this.svc.auth.encrypt(accessToken),
			encryptedRefresh = this.svc.auth.encrypt(
				refreshToken,
				accessToken.split('.').at(-1),
			);

		if (accessToken)
			reply.cookie(await hash(this.acsKey, 'base64url'), encryptedAccess);
		if (refreshToken)
			reply.cookie(
				await hash(this.rfsKey + '!', 'base64url'),
				encryptedRefresh,
			);

		reply.send({
			user: typeof response !== 'string' ? response : undefined,
			message: typeof response === 'string' ? response : undefined,
		});
	}

	/**
	 * Send client user's recieve infomations
	 * @param {FastifyReply} response - server's response
	 * @param {IUser} user - user's recieve infomations
	 * @return {Promise<void>}
	 */
	protected async responseWithUser(
		response: FastifyReply,
		user: User,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			response,
			await this.svc.session.getTokens(user, mtdt),
		);
	}

	/**
	 * Send signature to email
	 */
	protected async resetPasswordViaEmail(
		response: FastifyReply,
		hostname: string,
		{ email }: BaseUserEmail,
		mtdt: string,
	): Promise<void> {
		return this.responseWithUserRecieve(
			response,
			await this.svc.hook.assign(mtdt, async (s: string) => {
				const user = await this.svc.baseUser.email(email);

				if (!user) throw new ServerException('Invalid', 'Email', '');
				return this.svc.mail.send(email, 'Change password?', 'forgetPassword', {
					name: user.name,
					url: `${hostname}/hook/${s}`,
				});
			}),
		);
	}

	/**
	 * Change password
	 */
	protected async changePassword(
		signature: string,
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
					response,
					new UserRecieve({ response: 'Success_Change_Password' }),
				);
			}
		} catch (error) {
			throw error;
		}
	}
}

/**
 * Server global avatar file upload properties
 */
export const AvatarFileUpload = new ParseFilePipeBuilder()
	.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
	.addMaxSizeValidator({ maxSize: (0.3).mb2b })
	.build({
		fileIsRequired: false,
		errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
	});
