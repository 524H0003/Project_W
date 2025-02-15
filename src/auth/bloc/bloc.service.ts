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
		if (!owner && !this.svc.baseUser.id(owner.baseUser.id))
			throw new ServerException('Invalid', 'User', '');

		const bloc = new Bloc({
			prev,
			content: { metaData, lastIssue: currentTime() },
		});

		return this.save(bloc);
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
		let prev = await this.assign(user, null, mtdt);
		await this.use.ra(async () => {
			prev = await this.assign(user, prev.hash);
		});

		return new UserRecieve({
			accessToken: prev.id,
			refreshToken: prev.hash,
			response: user.info,
		});
	}

	/**
	 * Find bloc root by hash
	 * @param {string} hash - bloc hash
	 */
	async rootByHash(hash: string) {
		if (!hash) throw new ServerException('Invalid', 'Hash', '');

		let bloc = await this.findOne({ hash });
		while (bloc && bloc.owner == null)
			bloc = await this.findOne({ hash: bloc.prev });

		return bloc;
	}

	/**
	 * Find bloc root by id
	 * @param {string} id - bloc id
	 */
	async rootById(id: string) {
		if (!id) throw new ServerException('Invalid', 'ID', '');

		let bloc = await this.findOne({ id });
		while (bloc && bloc.owner == null)
			bloc = await this.findOne({ hash: bloc.prev });

		return bloc;
	}

	/**
	 * Issuing current bloc
	 * @param {string} hash - bloc hash
	 */
	async issue(hash: string) {
		return await this.update(
			{ hash },
			{ content: { lastIssue: currentTime() } },
		);
	}
}
