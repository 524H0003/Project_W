import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { BlocService } from 'auth/bloc/bloc.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * Check the access token from client
 */
@Injectable()
export class AccessStrategy extends PassportStrategy(Strategy, 'access') {
	/**
	 * Initiate access strategy
	 */
	constructor(
		config: ConfigService,
		private bloc: BlocService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			secretOrKey: config.get('ACCESS_SECRET'),
			ignoreExpiration: false,
		});
	}

	/**
	 * Validating the access token from client
	 * @param {IPayload} payload - the payload from token
	 */
	async validate({ accessToken }: IPayload) {
		const root = await this.bloc.rootById(accessToken);
		if (root) return root.owner;
		throw new ServerException('Invalid', 'ID', '');
	}
}
