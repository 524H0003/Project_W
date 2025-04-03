import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { Reciever } from './reciever.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { AppService } from 'app/app.service';
import { IRecieverRelationshipsKeys } from 'build/models';

@Injectable()
export class RecieverService extends DatabaseRequests<Reciever> {
	/**
	 * Initiate notification reciever
	 */
	constructor(
		@InjectRepository(Reciever) repo: Repository<Reciever>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, Reciever);
	}

	/**
	 * Pushing recievers to notification
	 * @param {string} notificationId - the notification's id
	 * @param {string[]} recievedUsersId - the recieved users' id
	 * @return {Promise<Reciever[]>}
	 */
	assignMany(
		notificationId: string,
		recievedUsersId: string[],
	): Promise<Reciever[]> {
		return Promise.all(
			recievedUsersId.map((userId) => this.assign(notificationId, userId)),
		);
	}

	/**
	 * Read a notification
	 * @param {string} recieverId - the reciever's id
	 */
	async read(recieverId: string): Promise<void> {
		await this.modify(recieverId, { isRead: true, readAt: new Date() });
	}

	/**
	 * Read notifications
	 * @param {string[]} notificationsId - the notification's id
	 * @return {Promise<Reciever[]>}
	 */
	async readMany(notificationsId: string[]): Promise<void> {
		await Promise.all(notificationsId.map((id) => this.read(id)));
	}

	// Abstract
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
		const fromNotification = await this.svc.notification.id(notificationId),
			toUser = await this.svc.user.id(recievedUserId);

		return this.save({ fromNotification, toUser });
	}

	public modify(
		id: string,
		update: DeepPartial<Reciever>,
		raw?: boolean,
	): Promise<void> {
		update = InterfaceCasting.delete(update, IRecieverRelationshipsKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
