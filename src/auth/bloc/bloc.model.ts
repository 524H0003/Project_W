import { IEntityId } from 'app/app.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Bloc infomations
 */
export interface IBlocInfo extends IEntityId {
	/**
	 * Previous bloc id
	 */
	prev?: string;

	/**
	 * Current bloc hash
	 */
	hash?: string;

	/**
	 * Current bloc meta data
	 */
	metaData?: object;

	/**
	 * Bloc last issue time
	 */
	lastIssue?: number;
}

/**
 * Bloc relationships
 */
export interface IBlocRelationships {
	/**
	 * Bloc owner id
	 */
	owner?: IUserEntity;
}

/**
 * Bloc entity
 */
export interface IBlocEntity extends IBlocInfo, IBlocRelationships {}
