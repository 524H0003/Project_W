import { ISession } from 'types';
import { IUser } from 'user/user.model';

// Interfaces
export interface IDevice {
	owner: IUser;
	child: string;
	sessions: ISession[];
	hashedUserAgent: string;
}
