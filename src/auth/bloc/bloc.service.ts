import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { Bloc } from './bloc.entity';
import { UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { MetaData } from 'auth/guards';
import { Cron } from '@nestjs/schedule';
import { toMs } from 'ms-typescript';
import { RequireOnlyOne } from 'app/utils/model.utils';
import { Not, IsNull } from 'typeorm';

/**
 * Bloc identifier
 */
interface IdOrHash {
	id: string;
	hash: string;
}

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
		@InjectRepository(Bloc, 'sqlite_db') repo: Repository<Bloc>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		private config: ConfigService,
	) {
		super(repo, Bloc);
	}

	/**
	 * Assign new bloc
	 * @param {string} ownerId - the owner of bloc id
	 * @param {string} prev - previous bloc hash
	 * @param {MetaData} metaData - client meta data
	 */
	assign(ownerId: string, prev: string | null, metaData?: MetaData) {
		const bloc = new Bloc({
			ownerId,
			prev,
			metaData: metaData ? JSON.stringify(sortObjectKeys(metaData)) : null,
		});

		return this.save(bloc);
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

			if (prevBloc.isNull() || (await this.removeStrayTree(prevBloc.id))) {
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

			if (!prevBloc.isNull()) await this.removeTree(prevBloc.id);
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
	 * @param {string} userId - user from request id
	 * @param {MetaData} mtdt - metadata from client
	 */
	async getTokens(userId: string, mtdt: MetaData) {
		const response = await this.svc.user.info(userId);
		let prev = await this.assign(response['id'], null, mtdt);

		await this.use.range(async () => {
			prev = await this.assign(null, prev.hash);
		});

		const { id, hash } = await this.save(prev);

		return new UserRecieve({ accessToken: id, refreshToken: hash, response });
	}

	/**
	 * Find bloc root
	 * @param {object} identifier - bloc indentifier
	 */
	async findRoot({ id, hash }: RequireOnlyOne<IdOrHash, 'hash' | 'id'>) {
		if (!id && !hash) throw new ServerException('Invalid', 'Token', '');

		let bloc = await this.findOne({ id, hash });
		while (bloc && bloc.ownerId == null)
			bloc = await this.findOne({ hash: bloc.prev });

		return bloc.ownerId !== null ? bloc : null;
	}

	/**
	 * Issuing current bloc
	 * @param {object} identifier - bloc indentifier
	 */
	async issue({ id, hash }: RequireOnlyOne<IdOrHash, 'hash' | 'id'>) {
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
