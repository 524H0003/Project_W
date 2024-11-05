import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Hook model
 */
export interface IHook {
	/**
	 * Hook's signature
	 */
	signature: string;

	/**
	 * Hook from user
	 */
	from: IUserEntity;

	/**
	 * Client's metadata
	 */
	mtdt: string;

	/**
	 * Addition infomations
	 */
	note: string;
}
