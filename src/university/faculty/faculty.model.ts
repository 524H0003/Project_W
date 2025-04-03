import { IEntityId } from 'app/typeorm/typeorm.model';
import { IEventCreatorEntity } from 'event/creator/creator.model';
import { IUserSignUp } from 'user/user.model';

// Interfaces
/**
 * Faculty relationships
 */
export interface IFacultyRelationship {
	eventCreator: IEventCreatorEntity;
}

/**
 * Faculty general infomations
 */
export interface IFacultyInfo extends IEntityId {
	/**
	 * Department name
	 */
	department: string;
}

/**
 * Faculty entity
 */
export interface IFacultyEntity extends IFacultyRelationship, IFacultyInfo {}

/**
 * Faculty assign
 */
export interface IFacultyAssign extends IFacultyInfo, IUserSignUp {}
