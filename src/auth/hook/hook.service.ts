import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Hook } from './hook.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MailService } from 'app/mail/mail.service';
import { UserRecieve } from 'user/user.class';
import { SignService } from 'auth/auth.service';

@Injectable()
export class HookService extends DatabaseRequests<Hook> {
	constructor(
		@InjectRepository(Hook) repo: Repository<Hook>,
		private mailSvc: MailService,
		private signSvc: SignService,
	) {
		super(repo);
	}

	async assign(email: string, host: string, mtdt: string) {
		const signature = (128).string,
			hook = await this.save({
				signature,
				mtdt,
				from: await this.mailSvc.sendResetPassword(email, host, signature),
			});

		return new UserRecieve({
			accessToken: this.signSvc.access(hook.id),
			refreshToken: this.signSvc.refresh(hook.from.id.length.string),
		});
	}

	async terminate(id: string) {
		await this.save({ id, isUsed: true });
	}
}
