import { IEntityId } from 'app/app.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Bloc infomations
 */
export interface IBlocInfo extends IEntityId {
	/**
	 * Previous bloc hash
	 */
	prev?: string;

	/**
	 * Current bloc hash
	 */
	hash?: string;

	/**
	 * Current bloc content
	 */
	content?: object;

	/**
	 * Bloc last issue time
	 */
	lastIssue?: number;
}

/**
 * Bloc relationships
 */
export interface IBlocRelationships {
	owner: IUserEntity;
}

/**
 * Bloc entity
 */
export interface IBlocEntity extends IBlocInfo, IBlocRelationships {}
