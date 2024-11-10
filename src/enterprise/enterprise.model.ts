import { IBaseUser } from 'app/app.model';
import { IStudentInfo } from 'university/student/student.model';
import { IEmployeeEntity } from './employee/employee.model';

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
	baseUser: IBaseUser;

	/**
	 * Enterprise's employees
	 */
	employees: IEmployeeEntity[];

	/**
	 * Enterprise's students
	 */
	students: IStudentInfo[];
}
