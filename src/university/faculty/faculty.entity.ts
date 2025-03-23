import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { IFacultyEntity, IFacultyInfo } from './faculty.model';
import { EventCreator } from 'event/creator/creator.entity';
import { IsString } from 'class-validator';
import { NonFunctionProperties, ParentId } from 'app/utils/typeorm.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { IFacultyInfoKeys } from 'build/models';
import { IUserInfo } from 'user/user.model';
import { IBaseUserInfo } from 'user/base/baseUser.model';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Faculty entity
 */
@CacheControl({ maxAge: (1).m2s })
@Entity({ name: 'FacultyUser' })
export class Faculty extends ParentId implements IFacultyEntity {
	/**
	 * Initiate faculty object
	 */
	constructor(payload: NonFunctionProperties<IFacultyEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IFacultyInfoKeys));
		this.eventCreator = new EventCreator(payload.eventCreator);
	}

	// Core Entity
	/**
	 * Base event creator
	 */
	@OneToOne(() => EventCreator, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
	eventCreator: EventCreator;

	// Infomations
	/**
	 * Department name
	 */
	@Column() @IsString() department: string;

	// Methods
	/**
	 * Entity base info
	 */
	get info(): { faculty: IFacultyInfo; user: IUserInfo & IBaseUserInfo } {
		return {
			faculty: InterfaceCasting.quick(this, IFacultyInfoKeys),
			user: this.eventCreator.user.info,
		};
	}

	/**
	 * Entity parent id
	 */
	get pid() {
		return this.eventCreator.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { department?: string }) {
		const { department = (10).string } = options || {},
			eventCreator = EventCreator.test(from);
		return new Faculty({ department, eventCreator });
	}
}
