import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { BlocService } from 'auth/bloc/bloc.service';
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
		config: ConfigService,
		private bloc: BlocService,
		private user: UserService,
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
		await this.bloc.issue({ id: accessToken });
		const root = await this.bloc.findRoot({ id: accessToken });
		if (root) return await this.user.findOne({ id: root.ownerId });
		throw new ServerException('Invalid', 'ID', '');
	}
}
