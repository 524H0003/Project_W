import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { Bloc } from './bloc.entity';
import { User } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { MetaData } from 'auth/guards';
import { RequireOnlyOne } from 'app/utils/model.utils';

/**
 * Bloc identifier
 */
interface IdOrHash {
	id: string;
	hash: string;
}

/**
 * Bloc required infomations
 */
interface BlocInput {
	prev: string;
	mtdt: MetaData;
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
		@InjectRepository(Bloc) repo: Repository<Bloc>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		private config: ConfigService,
	) {
		super(repo, Bloc);
	}

	/**
	 * Assign new bloc
	 * @param {User} owner - the owner of bloc id
	 * @param {string} prev - previous bloc id
	 * @param {MetaData} mtdt - client meta data
	 */
	async assign(
		owner: User,
		{ prev, mtdt }: RequireOnlyOne<BlocInput, 'mtdt' | 'prev'>,
	) {
		const updatePrev = async () => {
			if (!prev) return null;
			const { metaData } = await this.findOne({ id: prev });

			mtdt = metaData;

			await this.update({ id: prev }, { owner: null, metaData: {} }, true);

			return prev;
		};

		const bloc = new Bloc({ owner, prev: await updatePrev(), metaData: mtdt });

		return this.save(bloc);
	}

	/**
	 * Remove snake by id
	 * @param {string} blocId - removing bloc id
	 */
	async removeSnake(blocId: string) {
		if (!blocId) return;

		const { prev } = await this.findOne({ id: blocId }),
			{ id } = await this.findOne({ prev: blocId });

		await this.delete({ id: blocId });

		await this.removeSnake(prev);
		await this.removeSnake(id);
	}

	/**
	 * Issuing current bloc
	 * @param {object} identifier - bloc indentifier
	 */
	async issue({ id, hash }: RequireOnlyOne<IdOrHash, 'hash' | 'id'>) {
		await this.update({ hash, id }, { lastIssue: currentTime() });
	}
}
