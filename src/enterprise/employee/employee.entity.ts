import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { EmployeePosition, IEmployee } from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';
import { Enterprise } from 'enterprise/enterprise.entity';

@Entity({ name: 'EnterpriseUser' })
export class Employee implements IEmployee {
	// Core Entity
	@Column(() => EventCreator, { prefix: false })
	user: EventCreator;

	// Relationships
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.employees)
	@JoinColumn({ name: 'enterprise_id' })
	enterprise: Enterprise;

	// Infomations
	@Column({
		type: 'enum',
		enum: EmployeePosition,
		enumName: 'enterprise_position',
	})
	position: EmployeePosition;
}
