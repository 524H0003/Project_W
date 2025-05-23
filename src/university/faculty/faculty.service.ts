import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
	DatabaseRequests,
	NonFunctionProperties,
} from 'app/typeorm/typeorm.utils';
import { Faculty } from './faculty.entity';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IFacultyEntity } from './faculty.model';
import { IFacultyRelationshipKeys } from 'build/models';

/**
 * Faculty service
 */
@Injectable()
export class FacultyService extends DatabaseRequests<Faculty> {
	/**
	 * Initiate faculty service
	 */
	constructor(
		@InjectRepository(Faculty) repo: Repository<Faculty>,
		@Inject(forwardRef(() => AppService)) protected svc: AppService,
	) {
		super(repo, Faculty);
	}

	// Abstract
	/**
	 * Create faculty
	 */
	async assign(
		{ eventCreator, department }: NonFunctionProperties<IFacultyEntity>,
		avatar: MulterFile,
	): Promise<Faculty> {
		const { user } = eventCreator,
			{ baseUser, password, role } = user,
			{ email, name } = baseUser,
			existedUser = await this.svc.baseUser.email(email);

		if (!existedUser.isNull())
			throw new ServerException('Invalid', 'Email', '');

		return this.save({
			eventCreator: await this.svc.eventCreator.assign(
				await this.svc.auth.signUp({ name, email, password }, avatar, { role }),
			),
			department,
		});
	}

	public async modify(id: string, update: DeepPartial<Faculty>): Promise<void> {
		await this.svc.eventCreator.modify(id, update.eventCreator);
		update = InterfaceCasting.delete(update, IFacultyRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update);
	}
}
