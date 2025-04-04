import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { MetaData } from 'auth/guards';
import { BaseUser } from 'user/base/baseUser.entity';

/**
 * Hook service
 */
@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	/**
	 * Initiate hook service
	 */
	constructor(
		@InjectRepository(Hook) repo: Repository<Hook>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, Hook);
	}

	/**
	 * Validating hook
	 * @param {string} signature - hook's signature
	 * @param {MetaData} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 */
	async validating(
		signature: string,
		mtdt: MetaData,
		{ mtdt: hMtdt, id, signature: hSignature }: Hook,
	) {
		await this.remove(id);

		if (!compareMetaData(mtdt, hMtdt) || signature !== hSignature)
			throw new ServerException('Invalid', 'Hook', '');
	}

	// Abstract
	/**
	 * Assigning hook via email
	 * @param {MetaData} mtdt - client's metadata
	 * @param {Function} func - the method to recieve signature and return base user
	 * @param {object} note - additional infomation to store
	 */
	async assign(
		mtdt: MetaData,
		func: (signature: string) => Promise<BaseUser> | BaseUser,
		note?: object,
	) {
		const signature = (128).string,
			fromBaseUser = await func(signature);

		return this.save({ signature, mtdt, note, fromBaseUser });
	}

	// eslint-disable-next-line tsEslint/no-unused-vars
	public modify(id: string, update: DeepPartial<Hook>): Promise<void> {
		return;
	}
}
