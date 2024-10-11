import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { HookService } from 'auth/hook/hook.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class HookStrategy extends PassportStrategy(Strategy, 'hook') {
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

	async validate(payload: IPayload) {
		const hook = await this.hookSvc.id(payload.id, { deep: 2 });
		if (hook) return hook;
		throw new BadRequestException();
	}
}