import {
	BadRequestException,
	forwardRef,
	Inject,
	Injectable,
} from '@nestjs/common';
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
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Hook) repo: Repository<Hook>,
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
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
		to: '_Email' | '_Admin',
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
			response: 'Sent_Signature' + to,
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
			throw new BadRequestException('Invalid_Hook_Signature');

		await this.delete({ id: hook.id });
	}
}
