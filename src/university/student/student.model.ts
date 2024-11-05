import { IEnterprise } from 'enterprise/enterprise.model';
import { IUserSignUp, IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Student class
 */
export interface IStudentEntity extends ISutdentRelationship, IStudentInfo {}

/**
 * Student relationships
 */
export interface ISutdentRelationship {
	/**
	 * @ignore
	 */
	user: IUserEntity;

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
export interface IStudentSignup extends IStudentInfo, IUserSignUp {}
