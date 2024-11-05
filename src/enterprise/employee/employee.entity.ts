import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EmployeePosition,
	IEmployeeEntity,
	IEmployeeInfo,
} from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { User } from 'user/user.entity';
import { IUserAuthentication } from 'user/user.model';
import { IBaseUser } from 'app/app.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEmployeeInfoKeys } from 'models';

/**
 * Employee entity
 */
@Entity({ name: 'EnterpriseUser' })
export class Employee implements IEmployeeEntity {
	/**
	 * Create employee entity with infomations
	 */
	constructor(payload: IEmployeeInfo & IUserAuthentication & IBaseUser) {
		if (payload) {
			this.eventCreator = new EventCreator(payload);
			Object.assign(this, InterfaceCasting.quick(payload, IEmployeeInfoKeys));
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => EventCreator, { prefix: false })
	eventCreator: EventCreator;

	// Relationships
	/**
	 * Employee's working enterprise
	 */
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.employees, {
		nullable: false,
	})
	@JoinColumn({ name: 'enterprise_id' })
	enterprise: Enterprise;

	// Infomations
	/**
	 * Employee's position
	 */
	@Column({
		type: 'enum',
		enum: EmployeePosition,
		enumName: 'enterprise_position',
	})
	position: EmployeePosition;

	// Methods
	/**
	 * @ignore
	 */
	static test(from: string) {
		const { email = `${(7).string}@gmaill.vn`, password = (16).string + '!!' } =
				{},
			baseUser = User.test(from, { email, password }),
			eventCreator = EventCreator.test(from, { user: baseUser });
		return new Employee({
			...eventCreator,
			...eventCreator.user,
			...eventCreator.user.base,
			position: EmployeePosition.other,
		});
	}
}
