import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { Bloc } from './bloc.entity';
import { User, UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { MetaData } from 'auth/guards';

/**
 * Bloc service
 */
@Injectable()
export class BlocService extends DatabaseRequests<Bloc> {
	/**
	 * Refresh token use time
	 */
	private use: number = this.cfg.get('REFRESH_USE');

	/**
	 * Initiate bloc service
	 */
	constructor(
		@InjectRepository(Bloc) repo: Repository<Bloc>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		private cfg: ConfigService,
	) {
		super(repo);
	}

	/**
	 * Assign new bloc
	 * @param {User} owner - the owner of bloc
	 * @param {string} prev - previous bloc hash
	 */
	assign(owner: User, prev: string | null, metaData?: MetaData) {
		if (!owner || !this.svc.baseUser.id(owner.baseUser.id))
			throw new ServerException('Invalid', 'User', '');
		return this.save({ prev, content: { metaData, lastIssue: currentTime() } });
	}

	/**
	 * Remove bloc
	 * @param {string} id - bloc id
	 */
	remove(id: string) {
		return this.delete({ id });
	}

	/**
	 * Get tokens
	 * @param {User} user - user from request
	 * @param {MetaData} mtdt - metadata from client
	 */
	async getTokens(user: User, mtdt: MetaData) {
		const { access, refresh } = this.svc.sign;

		let prev = await this.assign(user, null, mtdt);
		await this.use.ra(async () => {
			prev = await this.assign(user, prev.hash);
		});

		return new UserRecieve({
			accessToken: access(prev.id),
			refreshToken: refresh(prev.hash),
			response: user.info,
		});
	}
}
