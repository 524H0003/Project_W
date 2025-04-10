import { ApiHideProperty } from '@nestjs/swagger';
import { IStudentInfo, IStudentSignUp } from './student.model';
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { FindUser } from 'user/user.dto';
import { Student } from './student.entity';
import { PaginateResult } from 'app/graphql/graphql.dto';

export class StudentSignUp implements IStudentSignUp {
	major: string;
	graduationYear: number;
	enrollmentYear: number;
	skills: string;
	password: string;
	name: string;
	@ApiHideProperty() avatarPath?: string;
	email: string;
	@ApiHideProperty() id: string;
}

@InputType()
export class FindStudent extends FindUser implements IStudentInfo {
	@Field({ nullable: true }) id: string;
	@Field({ nullable: true }) major: string;
	@Field({ nullable: true }) graduationYear: number;
	@Field({ nullable: true }) enrollmentYear: number;
	@Field({ nullable: true }) skills: string;
}

@ObjectType()
export class StudentPage extends PaginateResult(Student) {}
