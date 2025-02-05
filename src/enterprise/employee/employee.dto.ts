import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { EmployeePosition, IEmployeeHook } from './employee.model';

export class EmployeeHook implements IEmployeeHook {
	enterpriseName: string;
	name: string;
	@ApiHideProperty()
	avatarPath?: string;
	email: string;
	@ApiHideProperty()
	id?: string;
	@ApiProperty({ enum: EmployeePosition, default: EmployeePosition.Other })
	position: EmployeePosition;
}
