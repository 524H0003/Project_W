import { AppService } from 'app/app.service';
import { UserRecieve } from 'user/user.entity';
import { ConfigService } from '@nestjs/config';
import { HttpStatus, ParseFilePipeBuilder } from '@nestjs/common';
import { UserAuthencation } from 'user/user.dto';
import { Hook } from 'app/hook/hook.entity';
import { MetaData } from 'auth/guards';
import { BaseUserEmail } from 'user/base/baseUser.dto';

/**
 * Base controller
 */
export class BaseController {
	/**
	 * Initiate base controller
	 */
	constructor(
		protected svc: AppService,
		protected cfg: ConfigService,
	) {}

	/**
	 * Send signature to email
	 */
	protected async resetPasswordViaEmail(
		hostname: string,
		{ email }: BaseUserEmail,
		mtdt: MetaData,
	): Promise<UserRecieve> {
		const { id } = await this.svc.hook.assign(mtdt, async (s: string) => {
			const user = await this.svc.baseUser.email(email);

			if (user.isNull()) throw new ServerException('Invalid', 'Email', '');
			return this.svc.mail.send(email, 'Change password?', 'forgetPassword', {
				name: user.name,
				url: `${hostname}/change-password/${s}`,
			});
		});

		return new UserRecieve({
			HookId: id,
			response: { message: err('Success', 'Signature', 'Sent') },
		});
	}

	/**
	 * Change password
	 */
	protected async changePassword(
		signature: string,
		{ password }: UserAuthencation,
		mtdt: MetaData,
		hook: Hook,
	): Promise<UserRecieve> {
		await this.svc.hook.validating(signature, mtdt, hook);

		const user = await this.svc.user.findOne({
			baseUser: { email: hook.fromBaseUser.email },
			cache: false,
		});

		await this.svc.auth.changePassword(user, password);
		return new UserRecieve({
			isClearCookie: true,
			response: { message: err('Success', 'Password', 'Implementation') },
		});
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
