import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Reciever } from './reciever.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppService } from 'app/app.service';

@Injectable()
export class RecieverService extends DatabaseRequests<Reciever> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Reciever) repo: Repository<Reciever>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign notification to user
	 * @param {string} notificationId - the notification's id
	 * @param {string} recievedUserId - the recieved user's id
	 * @return {Promise<Reciever>}
	 */
	async assign(
		notificationId: string,
		recievedUserId: string,
	): Promise<Reciever> {
		const fromNotification = await this.svc.noti.id(notificationId),
			toUser = await this.svc.user.id(recievedUserId);

		return this.save({ fromNotification, toUser });
	}

	/**
	 * Pushing recievers to notification
	 * @param {string} notificationId - the notification's id
	 * @param {string[]} recievedUsersId - the recieved users' id
	 * @return {Promise<Reciever[]>}
	 */
	async assignMany(
		notificationId: string,
		recievedUsersId: string[],
	): Promise<Reciever[]> {
		return Promise.all(
			recievedUsersId.map((userId) => this.assign(notificationId, userId)),
		);
	}
}
