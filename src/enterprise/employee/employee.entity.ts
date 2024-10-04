import { Enterprise } from 'enterprise/enterprise.entity';
import { ChildEntity, Column, JoinColumn, ManyToOne } from 'typeorm';
import { EmployeePosition, IEmployee } from './employee.model';
import { EventCreator } from 'event/creator/creator.entity';

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
		enumName: 'enterprise_position',
	})
	position: EmployeePosition;
}
