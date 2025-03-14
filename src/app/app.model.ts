import { IHookEntity } from './hook/hook.model';

// Interfaces
/**
 * Base user info
 */
export interface IBaseUserInfo extends IBaseUserEmail, IEntityId {
	/**
	 * Base user name
	 */
	name: string;

	/**
	 * Base user's avatar path
	 */
	avatarPath?: string;
}

/**
 * Base user email
 */
export interface IBaseUserEmail {
	/**
	 * Base user email address
	 */
	email: string;
}

/**
 * Base user relationships
 */
export interface IBaseUserRelationships {
	hooks?: IHookEntity[];
}

/**
 * Entity id
 */
export interface IEntityId {
	/**
	 * Entity's unique Identify digits
	 */
	id?: string;
}

/**
 * Base user entity
 */
export interface IBaseUserEntity
	extends IBaseUserInfo,
		IBaseUserRelationships {}

/**
 * Signature interface
 */
export interface ISignature {
	signature: string;
}
