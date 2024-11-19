import { IBaseUserEntity } from 'app/app.model';

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
	fromBaseUser: IBaseUserEntity;

	/**
	 * Client's metadata
	 */
	mtdt: string;

	/**
	 * Addition infomations
	 */
	note: string;
}
