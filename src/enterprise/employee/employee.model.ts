import { IEnterprise } from 'enterprise/enterprise.model';
import { IUser } from 'user/user.model';

export interface IEmployee extends IUser {
	enterprise: IEnterprise;

	position: EmployeePosition;
}

// Enums
export enum EmployeePosition {
	manager = 'manager',
	hr = 'hr',
	recruiter = 'recruiter',
	other = 'other',
}
