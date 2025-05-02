import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { IPayload } from 'auth/auth.interface';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IRefreshResult } from '.';
import { BlocService } from 'auth/bloc/bloc.service';

/**
 * Check the refresh token from client
 */
@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'refresh') {
	/**
	 * Initiate refresh strategy
	 */
	constructor(
		protected config: ConfigService,
		protected bloc: BlocService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: config.get('REFRESH_SECRET'),
		});
	}

	/**
	 * Validating the refresh token
	 * @param {IPayload} payload - the payload from token
	 * @return {Promise<IRefreshResult>}
	 */
	async validate({ refreshToken }: IPayload): Promise<IRefreshResult> {
		const current = await this.bloc.id(refreshToken);

		if (current.isNull() || current.owner == null) {
			await this.bloc.removeSnake(current.id);
			throw new ServerException('Invalid', 'User', 'Access');
		}

		const { hash, id } = await this.bloc.assign(current.owner, {
			prev: current.id,
		});

		return { blocHash: hash, blocId: id, metaData: current.metaData };
	}
}
