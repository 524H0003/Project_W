import { Column, Entity } from 'typeorm';
import { IFacultyEntity, IFacultyInfo } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserInfoKeys,
	IFacultyInfoKeys,
	IUserAuthenticationKeys,
} from 'build/models';
import { IsString } from 'class-validator';
import { IUserSignUp, UserRole } from 'user/user.model';
import { BaseEntity } from 'app/utils/typeorm.utils';

/**
 * Faculty entity
 */
@Entity({ name: 'FacultyUser' })
export class Faculty extends BaseEntity implements IFacultyEntity {
	/**
	 * Initiate faculty object
	 */
	constructor(payload: IFacultyInfo & IUserSignUp) {
		super();

		if (payload instanceof Faculty) Object.assign(this, payload);
		else if (payload) {
			this.eventCreator = new EventCreator({
				...InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IBaseUserInfoKeys,
				]),
				role: UserRole.faculty,
			});
			Object.assign(this, InterfaceCasting.quick(payload, IFacultyInfoKeys));
		}
	}

	// Core Entity
	/**
	 * Base event creator
	 */
	@Column(() => EventCreator, { prefix: false }) eventCreator: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column() @IsString() department: string;

	// Methods
	/**
	 * Get entity id
	 */
	get id(): string {
		return this.eventCreator.id;
	}

	static test(from: string, options?: { department?: string }) {
		const { department = (10).string } = options || {},
			eventCreator = EventCreator.test(from);
		return new Faculty({
			department,
			...eventCreator,
			...eventCreator.user,
			...eventCreator.user.baseUser,
		});
	}
}
