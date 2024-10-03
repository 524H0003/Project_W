import { ISession } from 'session/session.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IDevice {
	owner: IUser;
	child: string;
	sessions: ISession[];
	hashedUserAgent: string;
}
