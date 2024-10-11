import { IUser } from 'user/user.model';

// Interfaces
export interface IHook {
	signature: string;
	isUsed: boolean;
	from: IUser;
	mtdt: string;
}
