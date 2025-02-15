import { UserRole } from 'user/user.model';

// Interfaces
/**
 * Option for sign up
 */
export interface IAuthSignUpOption {
	/**
	 * Role for the signing up user
	 */
	role: UserRole;
}

/**
 * Payload model
 */
export interface IPayload {
	/**
	 * Payload content
	 */
	payload: string;
}
