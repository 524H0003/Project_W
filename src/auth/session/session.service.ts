import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeviceService } from 'auth/device/device.service';
import { DeepPartial, Repository } from 'typeorm';
import { UserRecieve } from 'user/user.class';
import { Session } from './session.entity';

@Injectable()
export class SessionService extends DatabaseRequests<Session> {
	constructor(
		@InjectRepository(Session) repo: Repository<Session>,
		private cfgSvc: ConfigService,
		@Inject(forwardRef(() => DeviceService))
		private dvcSvc: DeviceService,
		private jwtSvc: JwtService,
	) {
		super(repo);
	}
	private readonly use = this.cfgSvc.get('REFRESH_USE');

	async assign(session: DeepPartial<Session>) {
		return new Session(await this.save({ ...session, useTimeLeft: this.use }));
	}

	async addNode(oldNode: Session) {
		const newSession = await this.save({
			device: oldNode.device,
			parrent: oldNode.device.id,
			useTimeLeft: this.use,
			child: oldNode.id,
		});
		await this.save({ id: oldNode.id, parrent: newSession.id });
		await this.dvcSvc.update({ id: oldNode.device.id, child: newSession.id });
		return new Session(newSession);
	}

	async addTokens(oldNodeId: string) {
		const newSession = await this.addNode(
				await this.id(oldNodeId, { deep: 3, relations: ['device'] }),
			),
			refreshToken = this.dvcSvc.refreshTokenSign(newSession.id),
			accessToken = this.jwtSvc.sign({ id: newSession.device.owner.id });

		return new UserRecieve({ accessToken, refreshToken });
	}

	async useToken(id: string) {
		const useTimeLeft = (await this.id(id)).useTimeLeft - 1;
		return new Session(await this.save({ id, useTimeLeft }));
	}

	remove(id: string) {
		return this.delete({ id });
	}
}
