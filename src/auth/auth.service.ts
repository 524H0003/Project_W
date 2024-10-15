import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cryption, validation } from 'app/utils/auth.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { DeviceService } from 'auth/device/device.service';
import { compareSync } from 'bcrypt';
import { FileService } from 'file/file.service';
import { ILoginKeys, ISignUpKeys } from 'models';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { ILogin, ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';

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
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}

	/**
	 * Sign up user
	 * @param {ISignUp} input - the sign up input
	 * @param {string} mtdt - client's metadata
	 * @param {Express.Multer.File} avatar - user's avatar
	 * @param {Object} options - function's options
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async signUp(
		input: ISignUp,
		mtdt: string,
		avatar: Express.Multer.File,
		options?: { role?: UserRole },
	): Promise<UserRecieve> {
		input = InterfaceCasting.quick(input, ISignUpKeys);
		const user = await this.usrSvc.email(input.email),
			{ role = UserRole.undefined } = options || {};
		if (!user) {
			const newUserRaw = new User({ ...input });
			return await validation(newUserRaw, async () => {
				if (newUserRaw.hashedPassword) {
					const newUser = await this.usrSvc.save(newUserRaw),
						avatarFile = await this.fileSvc.assign(avatar, newUser);
					await this.usrSvc.update({
						...newUser,
						avatarPath: avatarFile?.path,
						role,
					});
					return this.dvcSvc.getTokens(newUser, mtdt);
				}
			});
		}
		throw new BadRequestException('ExistedUser');
	}

	/**
	 * Login user
	 * @param {ILogin} input - the login input
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async login(input: ILogin, mtdt: string): Promise<UserRecieve> {
		input = InterfaceCasting.quick(input, ILoginKeys);
		const user = await this.usrSvc.email(input.email);
		if (user) {
			const isPasswordMatched = compareSync(
				input.password,
				user.hashedPassword,
			);
			if (isPasswordMatched) return this.dvcSvc.getTokens(user, mtdt);
		}
		throw new BadRequestException('InvalidAccessRequest');
	}

	/**
	 * Change user's password
	 * @param {User} iUser - input user
	 * @param {string} password - new password
	 * @return {Promise<User>} updated user
	 */
	changePassword(iUser: User, password: string): Promise<User> {
		const user = new User(iUser);
		user.password = password;
		return validation(user, async () => {
			if (user.hashedPassword) {
				const newUser = await this.usrSvc.save(user),
					status = await this.usrSvc.update({ ...newUser });
				return status;
			}
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
