import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cryption, validation } from 'app/utils/auth.utils';
import { DeviceService } from 'auth/device/device.service';
import { compareSync } from 'bcrypt';
import { FileService } from 'file/file.service';
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
		options?: { role?: UserRole; type?: typeof User },
	) {
		const user = await this.usrSvc.email(input.email),
			{ role = UserRole.undefined, type = User } = options || {};
		if (!user) {
			const newUserRaw = new type({ ...input });
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
}
