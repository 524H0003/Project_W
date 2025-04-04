import { IEntityId } from 'app/typeorm/typeorm.model';
import { IResult } from 'ua-parser-js';
import { IBaseUserEntity } from 'user/base/baseUser.model';

// Interfaces
/**
 * Signature interface
 */
export interface ISignature {
	signature: string;
}

/**
 * Hook relationships
 */
export interface IHookRelationships {
	/**
	 * Hook from user
	 */
	fromBaseUser: IBaseUserEntity;
}

/**
 * Hook model
 */
export interface IHookInfo extends ISignature, IEntityId {
	/**
	 * Client's metadata
	 */
	mtdt: IResult;

	/**
	 * Addition infomations
	 */
	note: object;
}

/**
 * Hook entity
 */
export interface IHookEntity extends IHookRelationships, IHookInfo {}
