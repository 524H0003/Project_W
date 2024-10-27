import {
	Injectable,
	NotAcceptableException,
	UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Refresh request interface
 */
export interface IRefreshResult {
	status: 'success' | 'fail' | 'lockdown';
	sessionId: string;
	userAgent?: string;
}

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
	 * @return {Promise<IRefreshResult>}
	 */
	async validate(payload: IPayload): Promise<IRefreshResult> {
		try {
			const session = await this.sesSvc.id(payload.id, { deep: 3 });
			if (session) {
				if (session.useTimeLeft > 0) {
					await this.sesSvc.useToken(session.id);
					return {
						status: 'success',
						userAgent: session.device.hashedUserAgent,
						sessionId: session.id,
					};
				} else {
					if ((await this.dvcSvc.id(session.device.id)).child === session.id)
						return { status: 'fail', sessionId: session.id };
					else return { status: 'lockdown', sessionId: session.id };
				}
			}
		} catch (error) {
			switch ((error as { name: string }).name) {
				case 'QueryFailedError':
					throw new NotAcceptableException('Invalid refresh token');
					break;

				default:
					throw error;
					break;
			}
		}
		throw new UnauthorizedException('Invalid refresh token');
	}
}
