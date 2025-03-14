import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
	DatabaseRequests,
	NonFunctionProperties,
} from 'app/utils/typeorm.utils';
import { Faculty } from './faculty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { validation } from 'app/utils/auth.utils';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IFacultyEntity } from './faculty.model';

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
				await this.svc.auth.signUp({ name, email, password }, avatar, {
					role,
				}),
			);

			return this.save({ eventCreator, department });
		});
	}

	/**
	 * Find faculty by id
	 * @param {string} id - faculty id
	 * @return {Promise<Faculty>}
	 */
	id(id: string): Promise<Faculty> {
		return this.findOne({ eventCreator: { user: { baseUser: { id } } } });
	}
}
