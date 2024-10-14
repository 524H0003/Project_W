import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { SignService } from 'auth/auth.service';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Check the refresh token from client
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	/**
	 * @ignore
	 */
	constructor(
		cfgSvc: ConfigService,
		private sesSvc: SessionService,
		private dvcSvc: DeviceService,
		private signSvc: SignService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: true,
			secretOrKey: cfgSvc.get('REFRESH_SECRET'),
		});
	}

	/**
	 * Validating the refresh token
	 * @param {IPayload} payload - the payload from token
	 */
	async validate(payload: IPayload) {
		const session = await this.sesSvc.id(payload.id, { deep: 3 });
		if (session) {
			if (session.useTimeLeft > 0) {
				await this.sesSvc.useToken(session.id);
				return {
					success: true,
					id: session.device.id, // for logout requests
					ua: session.device.hashedUserAgent,
					acsTkn: this.signSvc.access(session.device.owner.id),
					rfsTkn: this.signSvc.refresh(payload.id),
					usrInfo: session.device.owner.info,
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
