import { Column, Entity } from 'typeorm';
import { IFacultyEntity, IFacultyInfo } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserKeys,
	IFacultyInfoKeys,
	IUserAuthenticationKeys,
} from 'models';
import { IsString } from 'class-validator';
import { IUserSignUp } from 'user/user.model';

/**
 * Faculty entity
 */
@Entity({ name: 'FacultyUser' })
export class Faculty implements IFacultyEntity {
	/**
	 * @ignore
	 */
	constructor(payload: IFacultyInfo & IUserSignUp) {
		if (payload) {
			this.eventCreator = new EventCreator(
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserKeys,
				]),
			);
			Object.assign(this, InterfaceCasting.quick(payload, IFacultyInfoKeys));
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => EventCreator, { prefix: false })
	eventCreator: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column()
	@IsString()
	department: string;
}
