import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRecieve } from 'user/user.entity';
import { BaseUser } from 'app/app.entity';
import { AppService } from 'app/app.service';

/**
 * Hook service
 */
@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	constructor(
		@InjectRepository(Hook) repo: Repository<Hook>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assigning hook via email
	 * @param {string} mtdt - client's metadata
	 * @param {Function} func - the method to recieve signature and return base user
	 * @param {object} addInfo - additional infomation to store
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async assign(
		mtdt: string,
		func: (signature: string) => Promise<BaseUser> | void,
		addInfo?: object,
	): Promise<UserRecieve> {
		const signature = (128).string,
			baseUser = await func(signature),
			hook = await this.save({
				signature,
				mtdt,
				note: JSON.stringify(addInfo),
				fromBaseUser: baseUser ? baseUser : null,
			});

		return new UserRecieve({
			accessToken: this.svc.sign.access(hook.id),
			response: err('Success', 'Signature', 'Sent'),
		});
	}

	/**
	 * Validating hook
	 * @param {string} signature - hook's signature
	 * @param {string} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 */
	async validating(signature: string, mtdt: string, hook: Hook) {
		if (hook.mtdt !== mtdt || signature !== hook.signature)
			throw new ServerException('Invalid', 'Hook', '', 'user');

		await this.delete({ id: hook.id });
	}
}
