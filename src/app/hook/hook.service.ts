import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseUser } from 'app/app.entity';
import { AppService } from 'app/app.service';
import { MetaData } from 'auth/guards';

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

		await this.delete({ id: hook.id });
	}

	/**
	 * Removing hook
	 * @param {string} id - hook id
	 */
	async remove(id: string) {
		await this.delete({ id });
	}
}
