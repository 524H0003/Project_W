import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { HookService } from 'app/hook/hook.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Check the hook is valid
 */
@Injectable()
export class HookStrategy extends PassportStrategy(Strategy, 'hook') {
	/**
	 * @ignore
	 */
	constructor(
		cfgSvc: ConfigService,
		private hookSvc: HookService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: cfgSvc.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	/**
	 * Validating the hook
	 * @param {IPayload} payload - the payload from token
	 */
	async validate(payload: IPayload) {
		const hook = await this.hookSvc.id(payload.id, { deep: 2 });
		if (hook) return hook;
		throw new ServerException('Invalid', 'Hook', '', 'user');
	}
}
