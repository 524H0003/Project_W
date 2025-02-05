import { ApiHideProperty } from '@nestjs/swagger';
import { IStudentSignUp } from './student.model';

export class StudentSignUp implements IStudentSignUp {
	major: string;
	graduationYear: number;
	enrollmentYear: number;
	skills: string;
	password: string;
	name: string;
	@ApiHideProperty() avatarPath?: string;
	email: string;
	@ApiHideProperty() id?: string;
}
