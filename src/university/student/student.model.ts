import { IEnterprise } from 'enterprise/enterprise.model';
import { IUser } from 'user/user.model';

// Interfaces
/**
 * Student model
 */
export interface IStudent {
	/**
	 * @ignore
	 */
	user: IUser;

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

	/**
	 * Student current working enterprise
	 */
	currentEnterprise: IEnterprise;
}
