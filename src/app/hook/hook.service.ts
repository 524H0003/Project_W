import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { MetaData } from 'auth/guards';
import { BaseUser } from 'user/base/baseUser.entity';
import { IHookRelationshipsKeys } from 'build/models';

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
	async validating(signature: string, mtdt: MetaData, hook: Hook) {
		if (
			hook.mtdt.toString() !== mtdt.toString() ||
			signature !== hook.signature
		)
			throw new ServerException('Invalid', 'Hook', '');

		await this.remove(hook.id);
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

	/**
	 * Modify hook
	 */
	public modify(id: string, update: DeepPartial<Hook>): Promise<void> {
		update = InterfaceCasting.delete(update, IHookRelationshipsKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update);
	}
}
