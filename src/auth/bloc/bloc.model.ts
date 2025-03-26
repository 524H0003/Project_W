import { IEntityId } from 'app/app.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Bloc compulsory infomations
 */
export interface IBlocCompulsory extends IEntityId {
	/**
	 * Current bloc hash
	 */
	hash?: string;
}

/**
 * Bloc infomations
 */
export interface IBlocInfo extends IBlocCompulsory {
	/**
	 * Previous bloc id
	 */
	prev?: string;

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
