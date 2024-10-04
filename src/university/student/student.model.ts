import { IEnterprise } from 'enterprise/enterprise.model';
import { IUser } from 'user/user.model';

// Interfaces
export interface IStudent extends IUser {
	major: string;
	graduationYear: number;
	enrollmentYear: number;
	skills: string;
	currentEnterprise: IEnterprise;
}
