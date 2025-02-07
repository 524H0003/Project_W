import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Faculty } from './faculty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InterfaceCasting } from 'app/utils/utils';
import { IFacultyInfoKeys, IUserSignUpKeys } from 'build/models';
import { IFacultyAssign } from './faculty.model';
import { User } from 'user/user.entity';
import { validation } from 'app/utils/auth.utils';
import { UserRole } from 'user/user.model';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';

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
		super(repo);
	}

	/**
	 * Create faculty
	 */
	async assign(input: IFacultyAssign, avatar: MulterFile): Promise<User> {
		const existedUser = await this.svc.baseUser.email(input.email),
			rawFaculty = new Faculty(input);

		if (existedUser) throw new ServerException('Invalid', 'Email', '');

		return validation<User>(rawFaculty, async () => {
			const eventCreator = await this.svc.eventCreator.assign(
				await this.svc.auth.signUp(
					InterfaceCasting.quick(input, IUserSignUpKeys),
					avatar,
					{ role: UserRole.faculty },
				),
			);

			if (await eventCreator.user.hashingPassword()) {
				return (
					await this.save({
						eventCreator,
						...InterfaceCasting.quick(input, IFacultyInfoKeys),
					})
				).eventCreator.user;
			}
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
