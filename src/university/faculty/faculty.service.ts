import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Faculty } from './faculty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InterfaceCasting } from 'app/utils/utils';
import { IFacultyInfoKeys, IUserSignUpKeys } from 'models';
import { IFacultyAssign } from './faculty.model';
import { User } from 'user/user.entity';
import { UserService } from 'user/user.service';
import { AuthService } from 'auth/auth.service';
import { validation } from 'app/utils/auth.utils';
import { UserRole } from 'user/user.model';
import { EventCreatorService } from 'event/creator/creator.service';

/**
 * Faculty service
 */
@Injectable()
export class FacultyService extends DatabaseRequests<Faculty> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Faculty) repo: Repository<Faculty>,
		private usrSvc: UserService,
		private authSvc: AuthService,
		private evntCreSvc: EventCreatorService,
	) {
		super(repo);
	}

	/**
	 * Create faculty
	 */
	async assign(
		input: IFacultyAssign,
		avatar: Express.Multer.File,
	): Promise<User> {
		const existedUser = await this.usrSvc.email(input.email),
			rawFaculty = new Faculty(input);

		if (existedUser) return this.authSvc.login(input);

		return validation<User>(rawFaculty, async () => {
			const eventCreator = await this.evntCreSvc.assign(
				await this.authSvc.signUp(
					InterfaceCasting.quick(input, IUserSignUpKeys),
					avatar,
					{ role: UserRole.faculty },
				),
			);

			try {
				if (eventCreator.user.hashedPassword) {
					return (
						await this.save({
							eventCreator,
							...InterfaceCasting.quick(input, IFacultyInfoKeys),
						})
					).eventCreator.user;
				}
			} catch (error) {
				await this.evntCreSvc.remove({ user: eventCreator.user });
				throw error;
			}
		});
	}
}
