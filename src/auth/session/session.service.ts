import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'app/utils/auth.utils';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeviceService } from 'auth/device/device.service';
import { DeepPartial, Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { Session } from './session.entity';
import { SignService } from 'auth/auth.service';
import { User } from 'user/user.entity';

/**
 * Session service
 */
@Injectable()
export class SessionService extends DatabaseRequests<Session> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Session) repo: Repository<Session>,
		private cfgSvc: ConfigService,
		private dvcSvc: DeviceService,
		private signSvc: SignService,
	) {
		super(repo);
	}
	/**
	 * @ignore
	 */
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	/**
	 * Session assign
	 * @param {DeepPartial<Session>} session - the session's infomations
	 * @return {Promise<Session>} the session's infomations from database
	 */
	async assign(session: DeepPartial<Session>): Promise<Session> {
		return await this.save({ ...session, useTimeLeft: this.use });
	}

	/**
	 * Get device tokens for user's recieve infomations
	 * @param {User} user - the request from user
	 * @param {string} mtdt - metadata from client
	 */
	async getTokens(user: User, mtdt: string) {
		const device = await this.dvcSvc.save({
				owner: user,
				hashedUserAgent: hash(mtdt.toString()),
				child: null,
			}),
			session = await this.assign({
				child: null,
				parrent: device.id,
				device,
			}),
			refreshToken = this.signSvc.refresh(session.id),
			accessToken = this.signSvc.access(user.user.id);

		await this.dvcSvc.save({ ...device, child: session.id });

		return new UserRecieve({ accessToken, refreshToken, response: user.info });
	}

	/**
	 * Session add node to chain
	 * @param {Session} oldNode - the old node
	 * @return {Promise<Session>} the new node
	 */
	async addNode(oldNode: Session): Promise<Session> {
		const newSession = await this.save({
			device: oldNode.device,
			parrent: oldNode.device.id,
			useTimeLeft: this.use,
			child: oldNode.id,
		});
		await this.save({ id: oldNode.id, parrent: newSession.id });
		await this.dvcSvc.update({ id: oldNode.device.id, child: newSession.id });
		return newSession;
	}

	/**
	 * Return user's recieve infomations and add node to chain
	 * @param {string} oldSessionId - the id of old session
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async addTokens(oldSessionId: string): Promise<UserRecieve> {
		const newSession = await this.addNode(
				await this.id(oldSessionId, { deep: 4, relations: ['device'] }),
			),
			refreshToken = this.signSvc.refresh(newSession.id),
			accessToken = this.signSvc.access(newSession.device.owner.user.id);

		return new UserRecieve({
			accessToken,
			refreshToken,
			response: newSession.device.owner.info,
		});
	}

	/**
	 * Using token
	 * @param {string} id - the session id
	 * @return {Promise<Session>} the updated session
	 */
	async useToken(id: string): Promise<Session> {
		const useTimeLeft = (await this.id(id)).useTimeLeft - 1;
		return new Session(await this.save({ id, useTimeLeft }));
	}

	/**
	 * Rotating token
	 * @param {string} sessionId - the session id
	 */
	async rotateToken(sessionId: string) {
		const session = await this.id(sessionId, { deep: 4 }),
			refreshToken = this.signSvc.refresh(session.id),
			accessToken = this.signSvc.access(session.device.owner.user.id);
		return new UserRecieve({
			refreshToken,
			accessToken,
			response: session.device.owner.info,
		});
	}
}
