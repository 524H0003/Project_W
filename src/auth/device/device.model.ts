import { IEntityId } from 'app/app.model';
import { ISession } from 'auth/session/session.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Device relationship
 */
export interface IDeviceRelationship {
	/**
	 * Device's owner
	 */
	owner: IUserEntity;

	/**
	 * Device's sessions
	 */
	sessions: ISession[];
}

/**
 * Device infomations
 */
export interface IDeviceInfo extends IEntityId {
	/**
	 * Device's child
	 */
	child: string;

	/**
	 * Device's hashed useragent from client
	 */
	hashedUserAgent: string;
}

/**
 * Device entity
 */
export interface IDeviceEntity extends IDeviceInfo, IDeviceRelationship {}
