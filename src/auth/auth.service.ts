import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { User } from 'user/user.entity';
import { IUserLogIn, IUserSignUp, UserRole } from 'user/user.model';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IAuthSignUpOption } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { compare, SecurityService, validation } from './auth.utils';

/**
 * Auth service
 */
@Injectable()
export class AuthService extends SecurityService {
	/**
	 * Initiate auth service
	 */
	constructor(
		protected jwt: JwtService,
		protected cfg: ConfigService,
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
	) {
		super(jwt, cfg);
	}

	/**
	 * Sign up user
	 * @param {IUserSignUp} input - the sign up input
	 * @param {MulterFile} avatar - user's avatar
	 * @param {Object} options - function's options
	 * @return {Promise<User>} user's recieve infomations
	 */
	async signUp(
		{ name, email, password }: IUserSignUp,
		avatar: MulterFile,
		options?: IAuthSignUpOption,
	): Promise<User> {
		const user = await this.svc.user.email(email),
			{ role = UserRole.undefined } = options || {},
			rawUser = { password, baseUser: { email, name }, role };

		if (!user.isNull()) throw new ServerException('Invalid', 'User', 'SignUp');

		try {
			return validation(rawUser, async () => {
				const { id } = await this.svc.user.assign(rawUser);

				await this.svc.user.modify(
					id,
					avatar
						? {
								baseUser: {
									avatarPath: (await this.svc.file.assign(avatar, id)).path,
								},
							}
						: {},
				);

				return this.svc.user.id(id);
			});
		} catch (error) {
			switch ((error as { name: string }).name) {
				case 'BadRequestException':
					throw new ServerException('Invalid', 'Entity', 'SignUp');

				default:
					throw error;
			}
		}
	}

	/**
	 * Login user
	 * @param {IUserLogin} input - the login input
	 * @return {Promise<User>} user's recieve infomations
	 */
	async login({ email, password }: IUserLogIn): Promise<User> {
		const user = await this.svc.user.email(email);

		if (!user.isNull()) {
			if (await compare(password, user.hashedPassword)) return user;
			throw new ServerException('Invalid', 'Password', '');
		}
		throw new ServerException('Invalid', 'Email', '');
	}

	/**
	 * Change user's password
	 * @param {User} user - input user
	 * @param {string} password - new password
	 */
	async changePassword({ id }: User, password: string) {
		const newUser = User.changePassword(password);

		await this.svc.user.modify(id, newUser);
	}
}
