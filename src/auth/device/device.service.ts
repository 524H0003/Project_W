import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'app/utils/auth.utils';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { SessionService } from 'auth/session/session.service';
import { Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { Device } from './device.entity';
import { SignService } from 'auth/auth.service';

@Injectable()
export class DeviceService extends DatabaseRequests<Device> {
	constructor(
		@InjectRepository(Device) repo: Repository<Device>,
		@Inject(forwardRef(() => SessionService))
		private sesSvc: SessionService,
		@Inject(forwardRef(() => SignService))
		private signSvc: SignService,
	) {
		super(repo);
	}

	async getTokens(user: User, mtdt: string) {
		const device = await this.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				child: null,
			}),
			session = await this.sesSvc.assign({
				child: null,
				parrent: device.id,
				device,
			}),
			refreshToken = this.signSvc.refresh(session.id),
			accessToken = this.signSvc.access(user.id);

		await this.save({ ...device, child: session.id });

		return new UserRecieve({ accessToken, refreshToken });
	}

	async remove(id: string) {
		const { sessions } = await this.id(id, {});
		await Promise.all(
			sessions.map(async (i) => await this.sesSvc.remove(i.id)),
		);
		return this.delete({ id });
	}
}
