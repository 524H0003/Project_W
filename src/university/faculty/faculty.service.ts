import { Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Faculty } from './faculty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InterfaceCasting } from 'app/utils/utils';
import { IUserSignUpKeys } from 'models';
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
		const user = await this.usrSvc.email(input.email),
			rawFaculty = new Faculty(input);

		if (user) return this.authSvc.login(input);

		return validation<User>(rawFaculty, async () => {
			const user = await this.authSvc.signUp(
					InterfaceCasting.quick(input, IUserSignUpKeys),
					avatar,
					{ role: UserRole.faculty },
				),
				eventCreator = await this.evntCreSvc.assign(user);

			if (user.hashedPassword) {
				return (await this.save({ eventCreator })).eventCreator.user;
			}
		});
	}
}
