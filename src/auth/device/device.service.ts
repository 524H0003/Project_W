import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { SessionService } from 'auth/session/session.service';
import { DeleteResult, Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { User } from 'user/user.entity';
import { Device } from './device.entity';
import { SignService } from 'auth/auth.service';
import { hash } from 'app/utils/auth.utils';

/**
 * Device service
 */
@Injectable()
export class DeviceService extends DatabaseRequests<Device> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Device) repo: Repository<Device>,
		@Inject(forwardRef(() => SessionService))
		private sesSvc: SessionService,
		@Inject(forwardRef(() => SignService))
		private signSvc: SignService,
	) {
		super(repo);
	}

	/**
	 * Get device tokens for user's recieve infomations
	 * @param {User} user - the request from user
	 * @param {string} mtdt - metadata from client
	 */
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

	/**
	 * Remove device from user
	 * @param {string} id - the device id
	 * @return {Promise<DeleteResult>} delete result
	 */
	async remove(id: string): Promise<DeleteResult> {
		const { sessions } = await this.id(id, {});
		await Promise.all(
			sessions.map(async (i) => await this.sesSvc.remove(i.id)),
		);
		return this.delete({ id });
	}
}
