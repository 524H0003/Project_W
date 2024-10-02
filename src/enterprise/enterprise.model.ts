import { IInternship } from 'internship/internship.model';
import { IFaculty } from 'types';
import { IUser } from 'user/user.model';

// Interfaces
export interface IEnterprise extends IUser {
	website: string;
	internships: IInternship[];
	faculty: IFaculty;
}
