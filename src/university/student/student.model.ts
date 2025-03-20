import { IEntityId } from 'app/app.model';
import { IEnterpriseEntity } from 'enterprise/enterprise.model';
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
	 * Base user
	 */
	user: IUserEntity;

	/**
	 * Student current working enterprise
	 */
	currentEnterprise?: IEnterpriseEntity;
}

/**
 * Student general infomations
 */
export interface IStudentInfo extends IEntityId {
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
 * Student sign up
 */
export interface IStudentSignUp extends IStudentInfo, IUserSignUp {}
