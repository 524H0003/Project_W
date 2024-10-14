import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EmployeePosition, IEmployee } from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { User } from 'user/user.entity';

/**
 * Employee entity
 */
@Entity({ name: 'EnterpriseUser' })
export class Employee implements IEmployee {
	/**
	 * Create employee entity with infomations
	 */
	constructor(payload: IEmployee) {
		Object.assign(this, payload);
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => EventCreator, { prefix: false })
	user: EventCreator;

	// Relationships
	/**
	 * Employee's working enterprise
	 */
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.employees)
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
			baseUser = new User({ email, password, fullName: from }),
			user = EventCreator.test(from, { user: baseUser });
		return new Employee({
			user,
			enterprise: null,
			position: EmployeePosition.other,
		});
	}
}
