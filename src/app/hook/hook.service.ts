import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from 'app/mail/mail.service';
import { UserRecieve } from 'user/user.class';
import { SignService } from 'auth/auth.service';

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
		addInfo?: object,
	): Promise<UserRecieve> {
		const signature = (128).string,
			hook = await this.save({
				signature,
				mtdt,
				note: JSON.stringify(addInfo),
				from: {
					user: await this.mailSvc.sendResetPassword(email, host, signature),
				},
			});

		return new UserRecieve({
			accessToken: this.signSvc.access(hook.id),
			response: 'RequestSignatureFromEmail',
		});
	}

	/**
	 * Assigning hook via console
	 * @param {string} mtdt - client's metadata
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async assignViaConsole(mtdt: string): Promise<UserRecieve> {
		const signature = (128).string,
			hook = await this.save({ signature, mtdt, from: null });

		console.log(
			`${'-'.repeat(75)}\nOne time signature: ${signature}\n${'-'.repeat(75)}`,
		);

		return new UserRecieve({
			accessToken: this.signSvc.access(hook.id),
			refreshToken: this.signSvc.refresh(hook.id.length.string),
			response: 'RequestSignatureFromConsole',
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
			await this.delete({ id: hook.id });
			return;
		}
		throw new BadRequestException('InvalidHook');
	}
}
