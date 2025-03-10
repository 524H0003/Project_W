import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, SecurityService, validation } from 'app/utils/auth.utils';
import { FileService } from 'file/file.service';
import { User } from 'user/user.entity';
import { IUserLogIn, IUserSignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IAuthSignUpOption } from './auth.interface';
import { JwtService } from '@nestjs/jwt';
import { ExtendOptions } from 'app/utils/typeorm.utils';

/**
 * Auth service
 */
@Injectable()
export class AuthService extends SecurityService {
	/**
	 * Initiate auth service
	 */
	constructor(
		protected config: ConfigService,
		protected jwt: JwtService,
		private usrSvc: UserService,
		private fileSvc: FileService,
	) {
		super(jwt, config);
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
		options?: IAuthSignUpOption & ExtendOptions,
	): Promise<User> {
		const user = await this.usrSvc.email(email),
			{ role = UserRole.undefined, raw = false } = options || {},
			rawUser = new User({ password, baseUser: { email, name }, role });

		if (!user.isNull()) throw new ServerException('Invalid', 'User', 'SignUp');

		try {
			return validation(rawUser, async () => {
				const { id } = await this.usrSvc.assign(rawUser);

				return await this.usrSvc.modify(
					id,
					avatar
						? {
								baseUser: {
									avatarPath: (await this.fileSvc.assign(avatar, id)).path,
								},
							}
						: {},
					{ raw },
				);
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
		const user = await this.usrSvc.email(email, { raw: true });

		if (user) {
			if (await compare(password, user.hashedPassword)) return user;
			throw new ServerException('Invalid', 'Password', '');
		}
		throw new ServerException('Invalid', 'Email', '');
	}

	/**
	 * Change user's password
	 * @param {User} user - input user
	 * @param {string} password - new password
	 * @return {Promise<User>} updated user
	 */
	async changePassword(
		{ id, baseUser, role }: User,
		password: string,
	): Promise<User> {
		const { name, email } = baseUser;

		return this.usrSvc.modify(
			id,
			new User({ password, baseUser: { name, email }, role }),
		);
	}
}
