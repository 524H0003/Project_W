import { IEnterprise } from 'enterprise/enterprise.model';
import { ISignUp, IUser } from 'user/user.model';

// Interfaces
/**
 * Student model
 */
export interface IStudent extends IStudentInfo {
	/**
	 * @ignore
	 */
	user: IUser;

	/**
	 * Student current working enterprise
	 */
	currentEnterprise: IEnterprise;
}

/**
 * Student general infomations
 */
export interface IStudentInfo {
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
export interface IStudentSignup extends IStudentInfo, ISignUp {}
