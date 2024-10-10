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
import { User } from 'user/user.entity';
import { ILogin, ISignUp, UserRole } from 'user/user.model';
import { UserService } from 'user/user.service';

@Injectable()
export class AuthService extends Cryption {
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
		private fileSvc: FileService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
	) {
		super(cfgSvc.get('AES_ALGO'), cfgSvc.get('SERVER_SECRET'));
	}

	async signUp(
		input: ISignUp,
		mtdt: string,
		avatar: Express.Multer.File,
		options?: { role?: UserRole },
	) {
		input = InterfaceCasting.quick(input, ISignUpKeys);
		const user = await this.usrSvc.email(input.email),
			{ role = UserRole.undefined } = options || {};
		if (!user) {
			const newUserRaw = new User({ ...input });
			return await validation(newUserRaw, async () => {
				if (newUserRaw.hashedPassword) {
					const newUser = await this.usrSvc.assign(newUserRaw),
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
		throw new BadRequestException('Email already assigned');
	}

	async login(input: ILogin, mtdt: string) {
		input = InterfaceCasting.quick(input, ILoginKeys);
		const user = await this.usrSvc.email(input.email);
		if (user) {
			const isPasswordMatched = compareSync(
				input.password,
				user.hashedPassword,
			);
			if (isPasswordMatched) return this.dvcSvc.getTokens(user, mtdt);
		}
		throw new BadRequestException('Invalid email or password');
	}

	changePassword(iUser: User, password: string) {
		const user = new User(iUser);
		user.password = password;
		return validation(user, async () => {
			if (user.hashedPassword) {
				const newUser = await this.usrSvc.assign(user),
					status = await this.usrSvc.update({ ...newUser });
				return status;
			}
		});
	}
}

@Injectable()
export class SignService {
	constructor(
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
	) {}

	// session secret
	private readonly rfsScr = this.cfgSvc.get('REFRESH_SECRET');
	private readonly rfsExp = this.cfgSvc.get('REFRESH_EXPIRE');
	private readonly acsScr = this.cfgSvc.get('ACCESS_SECRET');
	private readonly acsExp = this.cfgSvc.get('ACCESS_EXPIRE');

	refresh(id: string) {
		return this.jwtSvc.sign(
			{ id },
			{ secret: this.rfsScr, expiresIn: this.rfsExp },
		);
	}

	access(id: string) {
		return this.jwtSvc.sign(
			{ id },
			{ secret: this.acsScr, expiresIn: this.acsExp },
		);
	}
}
