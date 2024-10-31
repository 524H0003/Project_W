import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnprocessableEntityException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cryption, validation } from 'app/utils/auth.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { compareSync } from 'bcrypt';
import { FileService } from 'file/file.service';
import { ILoginKeys, ISignUpKeys } from 'models';
import { User } from 'user/user.entity';
import { ILogin, ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';
import { IAuthSignUpOption } from './auth.model';

/**
 * Auth service
 */
@Injectable()
export class AuthService extends Cryption {
	/**
	 * @ignore
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
	 * @param {ISignUp} input - the sign up input
	 * @param {Express.Multer.File} avatar - user's avatar
	 * @param {Object} options - function's options
	 * @return {Promise<User>} user's recieve infomations
	 */
	async signUp(
		input: ISignUp,
		avatar: Express.Multer.File,
		options?: IAuthSignUpOption,
	): Promise<User> {
		input = InterfaceCasting.quick(input, ISignUpKeys);

		const user = await this.usrSvc.email(input.email),
			{ role = UserRole.undefined } = options || {},
			rawUser = new User({ ...input, email: input.email.toLowerCase() });

		if (user) throw new UnprocessableEntityException('Exist_User');

		try {
			return validation(rawUser, async () => {
				if (rawUser.hashedPassword) {
					const newUser = await this.usrSvc.assign({ ...rawUser, role }),
						avatarFile = await this.fileSvc.assign(avatar, newUser);
					return await this.usrSvc.modify({
						user: { id: newUser.user.id, avatarPath: avatarFile?.path },
					});
				}
			});
		} catch (error) {
			switch ((error as { name: string }).name) {
				case 'BadRequestException':
					throw new BadRequestException(
						JSON.parse((error as { message: string }).message),
					);
					break;

				default:
					throw error;
					break;
			}
		}
	}

	/**
	 * Login user
	 * @param {ILogin} input - the login input
	 * @return {Promise<User>} user's recieve infomations
	 */
	async login(input: ILogin): Promise<User> {
		input = InterfaceCasting.quick(input, ILoginKeys);

		const user = await this.usrSvc.email(input.email);

		if (user && compareSync(input.password, user.hashedPassword)) return user;
		if (!user) throw new NotFoundException('NotFound_User');
		throw new BadRequestException('Invalid_Password');
	}

	/**
	 * Change user's password
	 * @param {User} iUser - input user
	 * @param {string} password - new password
	 * @return {Promise<User>} updated user
	 */
	changePassword(iUser: User, password: string): Promise<User> {
		const user = new User({ ...iUser, ...iUser.user });
		user.password = password;
		return validation(user, () => {
			if (user.hashedPassword) return this.usrSvc.assign(user);
		});
	}
}

/**
 * Sign service
 */
@Injectable()
export class SignService {
	/**
	 * @ignore
	 */
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
