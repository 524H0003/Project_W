import { IEnterprise, IStudent } from 'types';
import { IUser } from 'user/user.model';

// Interfaces
export interface IFaculty extends IUser {
	enterprises: IEnterprise[];
	students: IStudent[];
}
