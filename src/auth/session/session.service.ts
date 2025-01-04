import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'app/utils/auth.utils';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository } from 'typeorm';
import { Session } from './session.entity';
import { User, UserRecieve } from 'user/user.entity';
import { AppService } from 'app/app.service';

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
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
	) {
		super(repo);
	}
	/**
	 * @ignore
	 */
	private _use: number;
	/**
	 * @ignore
	 */
	get use(): number {
		if (this._use) return this._use;
		return (this._use = this.svc.config.get('REFRESH_USE'));
	}

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
	 * @param {User} user -  user from the request
	 * @param {string} mtdt - metadata from client
	 */
	async getTokens(user: User, mtdt: string) {
		const hashedUserAgent = hash(mtdt),
			accessToken = this.svc.sign.access(user.id),
			device = await this.svc.device.assign({
				owner: await this.svc.user.email(user.baseUser.email),
				hashedUserAgent: accessToken,
				child: null,
			}),
			session = await this.assign({ child: null, parrent: device.id, device }),
			refreshToken = this.svc.sign.refresh(session.id);

		await this.svc.device.modify(device.id, {
			child: session.id,
			hashedUserAgent,
		});

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
		await this.svc.device.assign({
			id: oldNode.device.id,
			child: newSession.id,
		});
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
			refreshToken = this.svc.sign.refresh(newSession.id),
			accessToken = this.svc.sign.access(newSession.device.owner.id);

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
			refreshToken = this.svc.sign.refresh(session.id),
			accessToken = this.svc.sign.access(session.device.owner.id);
		return new UserRecieve({
			refreshToken,
			accessToken,
			response: session.device.owner.info,
		});
	}
}
