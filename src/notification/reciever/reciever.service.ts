import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Reciever } from './reciever.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
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

		return new Reciever(await this.save({ fromNotification, toUser }));
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

	/**
	 * Read a notification
	 * @param {string} recieverId - the reciever's id
	 * @param {string} userId - user's id
	 * @return {Promise<Reciever>}
	 */
	async read(recieverId: string, userId: string): Promise<Reciever> {
		return this.modify(recieverId, userId, {
			isRead: true,
			readAt: new Date(),
		});
	}

	/**
	 * Read notifications
	 * @param {string[]} notificationsId - the notification's id
	 * @param {string} userId - user's id
	 * @return {Promise<Reciever[]>}
	 */
	async readMany(
		notificationsId: string[],
		userId: string,
	): Promise<Reciever[]> {
		return Promise.all(notificationsId.map((id) => this.read(id, userId)));
	}

	/**
	 * Modify reciever
	 * @param {string} entityId - reciever's id
	 * @param {DeepPartial<Reciever>} updatedEntity - modified reciever
	 * @return {Promise<Reciever>}
	 */
	async modify(
		entityId: string,
		userId: string,
		updatedEntity: DeepPartial<Reciever>,
	): Promise<Reciever> {
		await this.update(
			{ id: entityId, toUser: { baseUser: { id: userId } } },
			updatedEntity,
		);
		return this.id(entityId);
	}
}
