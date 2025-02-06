import { IHook } from './hook/hook.model';

// Interfaces
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

export interface IBaseUserEmail {
	/**
	 * Base user email address
	 */
	email: string;
}

export interface IBaseUserRelationships {
	hooks: IHook[];
}

export interface IEntityId {
	/**
	 * Entity's unique Identify digits
	 */
	id?: string;
}

export interface IBaseUserEntity
	extends IBaseUserInfo,
		IBaseUserRelationships,
		IEntityId {}

export interface ISignature {
	signature: string;
}
