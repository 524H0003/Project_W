import { IEnterprise } from 'enterprise/enterprise.model';
import { IUserSignUp, IUserClass } from 'user/user.model';

// Interfaces
/**
 * Student class
 */
export interface IStudentClass extends ISutdentRelationship, IStudent {}

/**
 * Student relationships
 */
export interface ISutdentRelationship {
	/**
	 * @ignore
	 */
	user: IUserClass;

	/**
	 * Student current working enterprise
	 */
	currentEnterprise: IEnterprise;
}

/**
 * Student general infomations
 */
export interface IStudent {
	/**
	 * Student's major
	 */
	major: string;

	/**
	 * Student graduation year
	 */
	graduationYear: number;

	/**
	 * Student enrollment year
	 */
	enrollmentYear: number;

	/**
	 * Student's skills
	 */
	skills: string;
}

/**
 * Student signup
 */
export interface IStudentSignup extends IStudent, IUserSignUp {}
