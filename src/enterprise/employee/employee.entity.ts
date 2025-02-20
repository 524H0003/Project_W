import { BaseEntity, Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import {
	EmployeePosition,
	IEmployeeEntity,
	IEmployeeInfo,
} from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { User } from 'user/user.entity';
import { IUserAuthentication, IUserInfo, UserRole } from 'user/user.model';
import { IBaseUserInfo } from 'app/app.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEmployeeInfoKeys } from 'build/models';

/**
 * Employee entity
 */
@Entity({ name: 'EnterpriseUser' })
export class Employee extends BaseEntity implements IEmployeeEntity {
	/**
	 * Create employee entity with infomations
	 */
	constructor(payload: IEmployeeInfo & IUserAuthentication & IBaseUserInfo) {
		super();

		if (payload) {
			this.eventCreator = new EventCreator({
				...payload,
				role: UserRole.enterprise,
			});
			Object.assign(this, InterfaceCasting.quick(payload, IEmployeeInfoKeys));
		}
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@Column(() => EventCreator, { prefix: false }) eventCreator: EventCreator;

	// Relationships
	/**
	 * Employee's working enterprise
	 */
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.employees, {
		nullable: false,
		onDelete: 'CASCADE',
	})
	@JoinColumn({ name: 'enterpriseId' })
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
	 * A function return user's public infomations
	 */
	get info(): IEmployeeInfo & IUserInfo & IBaseUserInfo {
		return {
			...InterfaceCasting.quick(this, IEmployeeInfoKeys),
			...this.eventCreator.user.info,
		};
	}

	/**
	 * Get entity id
	 */
	get id(): string {
		return this.eventCreator.id;
	}

	/**
	 * @ignore
	 */
	static test(from: string) {
		const baseUser = User.test(from, { email: `${(7).string}@gmaill.vn` }),
			eventCreator = EventCreator.test(from, { user: baseUser });
		return new Employee({
			...eventCreator,
			...eventCreator.user,
			...eventCreator.user.baseUser,
			position: EmployeePosition['Other'],
		});
	}
}
