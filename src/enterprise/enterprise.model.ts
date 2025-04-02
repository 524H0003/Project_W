import { IStudentEntity } from 'university/student/student.model';
import { IEmployeeEntity } from './employee/employee.model';
import { IBaseUserEntity, IBaseUserInfo } from 'user/base/baseUser.model';

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
export interface IEnterpriseAssign extends IEnterpriseInfo, IBaseUserInfo {}

/**
 * Enterprise relationships
 */
export interface IEnterpriseRelationships {
	/**
	 * Base user
	 */
	baseUser: IBaseUserEntity;

	/**
	 * Enterprise's employees
	 */
	employees?: IEmployeeEntity[];

	/**
	 * Enterprise's students
	 */
	students?: IStudentEntity[];
}

/**
 * Enterprise model
 */
export interface IEnterpriseEntity
	extends IEnterpriseInfo,
		IEnterpriseRelationships {}
