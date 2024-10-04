import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionService } from 'auth/session/session.service';
import { Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { hash } from 'utils/auth.utils';
import { DatabaseRequests } from 'utils/typeorm.utils';
import { Device } from './device.entity';

@Injectable()
export class DeviceService extends DatabaseRequests<Device> {
	constructor(
		@InjectRepository(Device) repo: Repository<Device>,
		private jwtSvc: JwtService,
		private cfgSvc: ConfigService,
		@Inject(forwardRef(() => SessionService))
		private sesSvc: SessionService,
	) {
		super(repo);
	}
	// session secret
	private readonly scr = this.cfgSvc.get('REFRESH_SECRET');
	private readonly exp = this.cfgSvc.get('REFRESH_EXPIRE');

	refreshTokenSign(id: string) {
		return this.jwtSvc.sign({ id }, { secret: this.scr, expiresIn: this.exp });
	}

	async getTokens(user: User, mtdt: string) {
		const device = await this.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				child: null,
			}),
			session = await this.sesSvc.assign({
				child: null,
				parrent: device.id,
				device,
			}),
			refreshToken = this.refreshTokenSign(session.id),
			accessToken = this.jwtSvc.sign({ id: user.id });

		await this.save({ ...device, child: session.id });

		return new UserRecieve({ accessToken, refreshToken });
	}

	async remove(id: string) {
		const { sessions } = await this.id(id, {});
		await Promise.all(
			sessions.map(async (i) => await this.sesSvc.remove(i.id)),
		);
		return this.delete({ id });
	}
}
