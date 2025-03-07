import { IBaseUserEntity, ISignature } from 'app/app.model';

// Interfaces
/**
 * Hook model
 */
export interface IHook extends ISignature {
	/**
	 * Hook from user
	 */
	fromBaseUser: IBaseUserEntity;

	/**
	 * Client's metadata
	 */
	mtdt: object;

	/**
	 * Addition infomations
	 */
	note: object;
}
