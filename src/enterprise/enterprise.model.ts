import { IBaseUser } from 'app/app.model';
import { IStudent } from 'university/student/student.model';
import { IEmployeeClass } from './employee/employee.model';

// Interfaces
/**
 * Enterprise's general infomations
 */
export interface IEnterpriseInfo {
	/**
	 * Enterprise's description
	 */
	description: string;

	/**
	 * Enterprise's industry
	 */
	industry: string;
}

/**
 * Enterprise assign form
 */
export interface IEnterpriseAssign extends IEnterpriseInfo, IBaseUser {
	/**
	 * Signature to assign
	 */
	signature: string;
}

/**
 * Enterprise model
 */
export interface IEnterprise extends IEnterpriseInfo {
	/**
	 * Base user
	 */
	user: IBaseUser;

	/**
	 * Enterprise's employees
	 */
	employees: IEmployeeClass[];

	/**
	 * Enterprise's students
	 */
	students: IStudent[];
}
