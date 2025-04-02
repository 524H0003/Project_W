import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository } from 'typeorm';
import { Bloc } from './bloc.entity';
import { User } from 'user/user.entity';
import { MetaData } from 'auth/guards';
import { RequireOnlyOne } from 'app/utils/model.utils';
import { IBlocRelationshipsKeys } from 'build/models';

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
	 * Initiate bloc service
	 */
	constructor(@InjectRepository(Bloc) repo: Repository<Bloc>) {
		super(repo, Bloc);
	}

	/**
	 * Remove snake by id
	 * @param {string} blocId - removing bloc id
	 */
	async removeSnake(blocId: string) {
		if (!blocId) return;

		const { prev } = await this.id(blocId),
			{ id } = await this.findContinuousBloc(blocId);

		await this.remove(blocId);

		await this.removeSnake(prev);
		await this.removeSnake(id);
	}

	/**
	 * Issuing current bloc
	 * @param {object} identifier - bloc indentifier
	 */
	async issue({ id, hash }: RequireOnlyOne<IdOrHash, 'hash' | 'id'>) {
		return this.update({ hash, id }, { lastIssue: currentTime() });
	}

	/**
	 * Find continuous bloc
	 * @param {string} id - current bloc id
	 */
	async findContinuousBloc(id: string) {
		return this.findOne({ cache: false, prev: id });
	}

	/**
	 * Find bloc by hash
	 * @param {string} hash - current bloc hash
	 */
	async findBlocByHash(hash: string) {
		return this.findOne({ hash, cache: false });
	}

	// Abstract
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
			const { metaData } = await this.id(prev);

			mtdt = metaData;

			await this.modify(prev, { owner: null, metaData: {} }, true);

			return prev;
		};

		const bloc = new Bloc({ owner, prev: await updatePrev(), metaData: mtdt });

		return this.save(bloc);
	}

	public modify(
		id: string,
		update: DeepPartial<Bloc>,
		raw: boolean = false,
	): Promise<void> {
		return this.update({ id }, update, raw);
	}
}
