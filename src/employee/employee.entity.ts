import { Enterprise } from 'enterprise/enterprise.entity';
import { EventCreator } from 'event/event.entity';
import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { EmployeePosition, IEmployee } from './employee.model';

@ChildEntity()
export class Employee extends EventCreator implements IEmployee {
	// Relationships
	@ManyToOne(() => Enterprise, (_: Enterprise) => _.employees)
	@JoinColumn({ name: 'enterprise_id' })
	enterprise: Enterprise;

	// Infomations
	@Column({
		type: 'enum',
		enum: EmployeePosition,
		default: EmployeePosition.other,
		enumName: 'enterprise_position',
	})
	position: EmployeePosition;
}
