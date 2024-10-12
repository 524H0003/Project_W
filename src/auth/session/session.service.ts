import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeviceService } from 'auth/device/device.service';
import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { Session } from './session.entity';
import { SignService } from 'auth/auth.service';

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
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
		@Inject(forwardRef(() => SignService))
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
	 * @param {string} oldNodeId - the id of old node
	 * @return {Promise<UserRecieve>} user's recieve infomations
	 */
	async addTokens(oldNodeId: string): Promise<UserRecieve> {
		const newSession = await this.addNode(
				await this.id(oldNodeId, { deep: 3, relations: ['device'] }),
			),
			refreshToken = this.signSvc.refresh(newSession.id),
			accessToken = this.signSvc.access(newSession.device.owner.id);

		return new UserRecieve({ accessToken, refreshToken });
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
	 * Remove session
	 * @param {string} id - the session id
	 * @return {Promise<DeleteResult>} the delete result
	 */
	remove(id: string): Promise<DeleteResult> {
		return this.delete({ id });
	}
}
