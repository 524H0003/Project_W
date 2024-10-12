import { IEmployee } from 'enterprise/employee/employee.model';
import { IStudent } from 'university/student/student.model';

// Interfaces
/**
 * Enterprise model
 */
export interface IEnterprise {
	/**
	 * Enterprise's name
	 */
	name: string;

	/**
	 * Enterprise's description
	 */
	description: string;

	/**
	 * Enterprise's industry
	 */
	industry: string;

	/**
	 * Enterprise's avatar path
	 */
	avatarPath: string;

	/**
	 * Enterprise's employees
	 */
	employees: IEmployee[];

	/**
	 * Enterprise's students
	 */
	students: IStudent[];
}
