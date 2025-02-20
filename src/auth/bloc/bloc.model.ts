import { IEntityId } from 'app/app.model';

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
	 * Current bloc meta data
	 */
	metaData?: string;

	/**
	 * Bloc last issue time
	 */
	lastIssue?: number;

	/**
	 * Bloc owner id
	 */
	ownerId?: string;
}

/**
 * Bloc entity
 */
export interface IBlocEntity extends IBlocInfo {}
