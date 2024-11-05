import { ISession } from 'auth/session/session.model';
import { IUserEntity } from 'user/user.model';

// Interfaces
/**
 * Device model
 */
export interface IDevice {
	/**
	 * Device's owner
	 */
	owner: IUserEntity;

	/**
	 * Device's child
	 */
	child: string;

	/**
	 * Device's sessions
	 */
	sessions: ISession[];

	/**
	 * Device's hashed useragent from client
	 */
	hashedUserAgent: string;
}
