import { ISession } from 'auth/session/session.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IDevice {
	owner: IUser;
	child: string;
	sessions: ISession[];
	hashedUserAgent: string;
}
