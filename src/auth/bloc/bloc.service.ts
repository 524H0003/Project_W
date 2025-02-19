import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { Bloc } from './bloc.entity';
import { User, UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { MetaData } from 'auth/guards';
import { Cron } from '@nestjs/schedule';
import { toMs } from 'ms-typescript';
import { RequireOnlyOne } from 'app/utils/model.utils';
import { Not, IsNull } from 'typeorm';

/**
 * Bloc service
 */
@Injectable()
export class BlocService extends DatabaseRequests<Bloc> {
	/**
	 * Refresh token use time
	 */
	private use: number = this.config.get('REFRESH_USE');

	/**
	 * Initiate bloc service
	 */
	constructor(
		@InjectRepository(Bloc) repo: Repository<Bloc>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		private config: ConfigService,
	) {
		super(repo);
	}

	/**
	 * Assign new bloc
	 * @param {User} owner - the owner of bloc
	 * @param {string} prev - previous bloc hash
	 */
	new(owner: User | null, prev: string | null, metaData?: MetaData) {
		const bloc = new Bloc({ owner, prev, content: { metaData } });

		return bloc;
	}

	/**
	 * Remove stray tree by id
	 * @param {string} deleteId - bloc id
	 */
	async removeStrayTree(deleteId: string): Promise<Boolean> {
		if (!deleteId) throw new ServerException('Invalid', 'ID', '');

		const { prev } = await this.findOne({ id: deleteId });

		if (prev) {
			const prevBloc = await this.findOne({ hash: prev });

			if (!prevBloc || (await this.removeStrayTree(prevBloc.id))) {
				await this.removeBloc(deleteId);
				return true;
			}
		}

		return false;
	}

	/**
	 * Remove tree by id
	 * @param {string} deleteId - bloc id
	 */
	async removeTree(deleteId: string): Promise<void> {
		if (!deleteId) throw new ServerException('Invalid', 'ID', '');

		const { prev } = await this.findOne({ id: deleteId });

		if (prev) {
			const prevBloc = await this.findOne({ hash: prev });

			if (prevBloc) await this.removeTree(prevBloc.id);
		}

		await this.removeBloc(deleteId);
	}

	/**
	 * Remove bloc by id
	 * @param {string} id - deleting bloc
	 */
	removeBloc(id: string) {
		return this.delete({ id });
	}

	/**
	 * Get tokens
	 * @param {User} user - user from request
	 * @param {MetaData} mtdt - metadata from client
	 */
	async getTokens(user: User, mtdt: MetaData) {
		const blocs: Bloc[] = [];

		let prev = this.new(user, null, mtdt);

		await this.use.range(() => {
			blocs.push(prev);
			prev = this.new(null, prev.hashBloc());
		});

		await this.saveMany(blocs);
		const { id, hash } = await this.save(prev);

		return new UserRecieve({
			accessToken: id,
			refreshToken: hash,
			response: { user: user.info },
		});
	}

	/**
	 * Find bloc root by hash
	 * @param {string} hash - bloc hash
	 */
	async findRootByHash(hash: string) {
		if (!hash) throw new ServerException('Invalid', 'Hash', '');

		let bloc = await this.findOne({ hash });
		while (bloc && bloc.owner == null)
			bloc = await this.findOne({ hash: bloc.prev });

		return bloc.owner !== null ? bloc : null;
	}

	/**
	 * Find bloc root by id
	 * @param {string} id - bloc id
	 */
	async findRootById(id: string) {
		if (!id) throw new ServerException('Invalid', 'ID', '');

		let bloc = await this.findOne({ id });
		while (bloc && bloc.owner == null)
			bloc = await this.findOne({ hash: bloc.prev });

		return bloc.owner !== null ? bloc : null;
	}

	/**
	 * Issuing current bloc
	 * @param {string} hash - bloc hash
	 */
	async issue({
		id,
		hash,
	}: RequireOnlyOne<{ hash: string; id: string }, 'hash' | 'id'>) {
		return await this.update({ hash, id }, { lastIssue: currentTime() });
	}

	@Cron('0 0 * * * *') async randomRemoveTree() {
		const blocs = await this.find({ lastIssue: Not(IsNull()) });

		for (const { id, lastIssue } of blocs) {
			const allowUsage = toMs(this.svc.cfg.get('REFRESH_EXPIRE')) / 1000;

			if (currentTime() - lastIssue > allowUsage) await this.removeTree(id);
			else await this.removeStrayTree(id);
		}
	}
}
