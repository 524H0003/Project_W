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
import { validation } from 'auth/auth.utils';

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
			existedUser = await this.svc.baseUser.email(email),
			rawFaculty = new Faculty({ eventCreator, department });

		if (!existedUser.isNull())
			throw new ServerException('Invalid', 'Email', '');

		return validation<Faculty>(rawFaculty, async () => {
			const eventCreator = await this.svc.eventCreator.assign(
				await this.svc.auth.signUp({ name, email, password }, avatar, { role }),
			);

			return this.save({ eventCreator, department });
		});
	}

	public modify(
		id: string,
		update: DeepPartial<Faculty>,
		raw?: boolean,
	): Promise<void> {
		update = InterfaceCasting.delete(update, IFacultyRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
