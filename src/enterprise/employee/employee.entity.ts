import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import {
	EmployeePosition,
	IEmployeeEntity,
	IEmployeeInfo,
} from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';
import { Enterprise } from 'enterprise/enterprise.entity';
import { User } from 'user/user.entity';
import { IUserInfo } from 'user/user.model';
import { IBaseUserInfo } from 'app/app.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEmployeeInfoKeys } from 'build/models';
import {
	NonFunctionProperties,
	SensitiveInfomations,
} from 'app/utils/typeorm.utils';

/**
 * Employee entity
 */
@Entity({ name: 'EnterpriseUser' })
export class Employee extends SensitiveInfomations implements IEmployeeEntity {
	/**
	 * Create employee entity with infomations
	 */
	constructor(payload: NonFunctionProperties<IEmployeeEntity>) {
		super();
		if (!payload) return;

		Object.assign(this, InterfaceCasting.quick(payload, IEmployeeInfoKeys));
		this.eventCreator = new EventCreator(payload.eventCreator);
		this.enterprise = new Enterprise(payload.enterprise);
	}

	// Core Entity
	/**
	 * @ignore
	 */
	@OneToOne(() => EventCreator, { onDelete: 'CASCADE', eager: true })
	@JoinColumn()
	eventCreator: EventCreator;

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
	 * Entity id
	 */
	// @ts-ignore
	get id() {
		return this.eventCreator.id;
	}

	/**
	 * @ignore
	 */
	set id(x: string) {}

	/**
	 * @ignore
	 */
	static test(from: string) {
		const baseUser = User.test(from, { email: `${(7).string}@gmaill.vn` }),
			eventCreator = EventCreator.test(from, { user: baseUser }),
			enterprise = Enterprise.test(from);
		return new Employee({
			eventCreator,
			enterprise,
			position: EmployeePosition['Other'],
		});
	}
}
