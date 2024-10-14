import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { MailService } from 'app/mail/mail.service';
import { UserRecieve } from 'user/user.class';
import { SignService } from 'auth/auth.service';
import { IUserInfo } from 'user/user.model';

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
		private mailSvc: MailService,
		private signSvc: SignService,
	) {
		super(repo);
	}

	/**
	 * Assigning hook via email
	 * @param {string} email - user's email
	 * @param {string} host - request's hostname
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async assignViaEmail(
		email: string,
		host: string,
		mtdt: string,
	): Promise<UserRecieve> {
		const signature = (128).string,
			hook = await this.save({
				signature,
				mtdt,
				from: await this.mailSvc.sendResetPassword(email, host, signature),
			});

		return new UserRecieve({
			accessToken: this.signSvc.access(hook.id),
			refreshToken: this.signSvc.refresh(hook.from.id.length.string),
			info: {} as IUserInfo,
		});
	}

	/**
	 * Assigning hook via console
	 * @param {string} host - request's hostname
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async assignViaConsole(host: string, mtdt: string): Promise<UserRecieve> {
		const signature = (128).string,
			hook = await this.save({
				signature,
				mtdt,
				from: null,
			});

		console.log(
			`${'-'.repeat(20)}\nOne time signature: ${signature}\n${'-'.repeat(20)}`,
		);

		return new UserRecieve({
			accessToken: this.signSvc.access(hook.id),
			refreshToken: this.signSvc.refresh(hook.id.length.string),
			info: {} as IUserInfo,
		});
	}

	/**
	 * Validating hook
	 * @param {string} signature - hook's signature
	 * @param {string} mtdt - client's metadata
	 * @param {Hook} hook - recieved hook from client
	 */
	async validating(signature: string, mtdt: string, hook: Hook) {
		if (hook.mtdt === mtdt && signature == hook.signature) {
			await this.terminate(hook.id);
			return;
		}
		throw new BadRequestException('InvalidHook');
	}

	/**
	 * Assigning used status to hook
	 * @param {string} id - hook's id
	 * @return {Promise<DeleteResult>} updated hook
	 */
	terminate(id: string): Promise<DeleteResult> {
		return this.delete({ id });
	}
}
