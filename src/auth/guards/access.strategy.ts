import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'user/user.service';

/**
 * Check the access token from client
 */
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
	/**
	 * Initiate access strategy
	 */
	constructor(
		cfgSvc: ConfigService,
		private usrSvc: UserService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	/**
	 * Validating the access token from client
	 * @param {IPayload} payload - the payload from token
	 */
	async validate(payload: IPayload) {
		const user = await this.usrSvc.id(payload.id);
		if (user) return user;
		throw new ServerException('Forbidden', 'Method', 'Access');
	}
}
