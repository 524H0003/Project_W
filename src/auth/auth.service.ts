import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare, Cryption, validation } from 'app/utils/auth.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { FileService } from 'file/file.service';
import { IUserRelationshipKeys, IUserSignUpKeys } from 'build/models';
import { User } from 'user/user.entity';
import { IUserLogIn, IUserSignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IAuthSignUpOption } from './auth.interface';

/**
 * Auth service
 */
@Injectable()
export class AuthService extends Cryption {
	/**
	 * Initiate auth service
	 */
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
		private fileSvc: FileService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}

	/**
	 * Sign up user
	 * @param {IUserSignUp} input - the sign up input
	 * @param {MulterFile} avatar - user's avatar
	 * @param {Object} options - function's options
	 * @return {Promise<User>} user's recieve infomations
	 */
	async signUp(
		input: IUserSignUp,
		avatar: MulterFile,
		options?: IAuthSignUpOption,
	): Promise<User> {
		input = InterfaceCasting.quick(input, IUserSignUpKeys);

		const user = await this.usrSvc.email(input.email),
			{ role = UserRole.undefined } = options || {},
			rawUser = new User({ ...input, email: input.email.lower });

		if (user) throw new ServerException('Invalid', 'User', 'SignUp');

		try {
			return validation(rawUser, async () => {
				const { id } = await this.usrSvc.assign({
					...rawUser,
					...rawUser.baseUser,
					role,
				});
				return await this.usrSvc.modify(
					id,
					avatar
						? {
								baseUser: {
									avatarPath: (await this.fileSvc.assign(avatar, id)).path,
								},
							}
						: {},
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
		const user = await this.usrSvc.email(email);

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
	async changePassword(user: User, password: string): Promise<User> {
		let newUser = await this.usrSvc.id(user.id);
		newUser.password = password;
		return validation(newUser, async () => {
			newUser = InterfaceCasting.delete(newUser, IUserRelationshipKeys);
			return this.usrSvc.modify(user.id, newUser);
		});
	}
}

/**
 * Sign service
 */
@Injectable()
export class SignService {
	constructor(
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	// session secret
	/**
	 * @ignore
	 */
	private readonly rfsScr = this.cfgSvc.get('REFRESH_SECRET');
	/**
	 * @ignore
	 */
	private readonly rfsExp = this.cfgSvc.get('REFRESH_EXPIRE');
	/**
	 * @ignore
	 */
	private readonly acsScr = this.cfgSvc.get('ACCESS_SECRET');
	/**
	 * @ignore
	 */
	private readonly acsExp = this.cfgSvc.get('ACCESS_EXPIRE');

	/**
	 * Refresh token signer
	 * @param {string} id - input id
	 * @return {string} refresh token
	 */
	refresh(id: string): string {
		return this.jwtSvc.sign(
			{ id },
			{ secret: this.rfsScr, expiresIn: this.rfsExp },
		);
	}

	/**
	 * Access token signer
	 * @param {string} id - input id
	 * @return {string} access token
	 */
	access(id: string): string {
		return this.jwtSvc.sign(
			{ id },
			{ secret: this.acsScr, expiresIn: this.acsExp },
		);
	}

	/**
	 * Verify token
	 * @param {string} input - input token
	 * @param {object} options - function's option
	 * @return {object} token content
	 */
	verify(input: string, options?: { type: 'refresh' | 'access' }): object {
		const { type = 'access' } = options || {};
		return this.jwtSvc.verify(input, {
			secret: type === 'access' ? this.acsScr : this.rfsScr,
		});
	}
}
