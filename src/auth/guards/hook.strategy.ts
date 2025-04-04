import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { HookService } from 'app/hook/hook.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Hook } from 'app/hook/hook.entity';

/**
 * Check the hook is valid
 */
@Injectable()
export class HookStrategy extends PassportStrategy(Strategy, 'hook') {
	/**
	 * Initiate hook strategy
	 */
	constructor(
		private config: ConfigService,
		private hook: HookService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	/**
	 * Validating the hook
	 * @param {IPayload} payload - the payload from token
	 */
	async validate({ accessToken }: IPayload): Promise<Hook> {
		return this.hook.id(accessToken);
	}
}
