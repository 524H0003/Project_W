import { IEntityId } from 'app/app.model';
import { IHookEntity } from 'app/hook/hook.model';

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
 * Base user relationships
 */
export interface IBaseUserRelationships {
	hooks?: IHookEntity[];
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
 * Base user entity
 */
export interface IBaseUserEntity
	extends IBaseUserInfo,
		IBaseUserRelationships {}
