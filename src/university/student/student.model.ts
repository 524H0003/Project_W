import { IEnterprise } from 'enterprise/enterprise.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IStudent {
	user: IUser;
	major: string;
	graduationYear: number;
	enrollmentYear: number;
	skills: string;
	currentEnterprise: IEnterprise;
}
