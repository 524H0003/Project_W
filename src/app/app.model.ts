// Interfaces
export interface IBaseUserInfo {
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

export interface IEntityId {
	/**
	 * Entity's unique Identify digits
	 */
	id?: string;
}

export interface IBaseUser extends IBaseUserInfo, IBaseUserEmail, IEntityId {}
