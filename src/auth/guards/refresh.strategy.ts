import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IRefreshResult } from '.';

/**
 * Check the refresh token from client
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	/**
	 * Initiate refresh strategy
	 */
	constructor(protected cfgSvc: ConfigService) {
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
						hashedUserAgent: session.device.hashedUserAgent,
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
					break;
			}
		}
		throw new ServerException('Invalid', 'Token', '');
	}
}
