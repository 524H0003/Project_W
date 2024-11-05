import { IEventCreatorEntity } from 'event/creator/creator.model';
import { IUserSignUp } from 'user/user.model';

// Interfaces
/**
 * @ignore
 */
export interface IFacultyRelationship {
	eventCreator: IEventCreatorEntity;
}

/**
 * Faculty general infomations
 */
export interface IFacultyInfo {
	/**
	 * Department name
	 */
	department: string;
}

/**
 * @ignore
 */
export interface IFacultyEntity extends IFacultyRelationship, IFacultyInfo {}

/**
 * Faculty assign
 */
export interface IFacultyAssign extends IFacultyInfo, IUserSignUp {
	/**
	 * Signature to assign
	 */
	signature: string;
}
