import { IUser } from 'user/user.model';

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
	 * If hook used
	 */
	isUsed: boolean;

	/**
	 * Hook from user
	 */
	from: IUser;

	/**
	 * Client's metadata
	 */
	mtdt: string;
}
