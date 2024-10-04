import { IEmployee } from 'enterprise/employee/employee.model';
import { IStudent } from 'university/student/student.model';

// Interfaces
export interface IEnterprise {
	name: string;
	description: string;
	industry: string;
	avatarPath: string;

	employees: IEmployee[];
	students: IStudent[];
}
