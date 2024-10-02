import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { DeviceService } from 'device/device.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SessionService } from 'session/session.service';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	constructor(
		cfgSvc: ConfigService,
		private sesSvc: SessionService,
		private jwtSvc: JwtService,
		private dvcSvc: DeviceService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: cfgSvc.get('REFRESH_SECRET'),
		});
	}

	async validate(payload: IPayload) {
		const session = await this.sesSvc.id(payload.id, { deep: 3 });
		if (session) {
			if (session.useTimeLeft > 0) {
				await this.sesSvc.useToken(session.id);
				return {
					success: true,
					id: session.device.id, // for logout requests
					ua: session.device.hashedUserAgent,
					acsTkn: this.jwtSvc.sign({ id: session.device.owner.id }),
					rfsTkn: this.dvcSvc.refreshTokenSign(payload.id),
				};
			} else {
				if ((await this.dvcSvc.id(session.device.id)).child === session.id)
					return { success: false, id: session.id };
				else return { lockdown: true, id: session.device.id };
			}
		}
		throw new UnauthorizedException('Invalid refresh token');
	}
}
