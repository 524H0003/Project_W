import { ApiHideProperty } from '@nestjs/swagger';
import {
	IUserAuthentication,
	IUserInfo,
	IUserLogIn,
	IUserSignUp,
	UserRole,
} from './user.model';
import { Field, InputType } from '@nestjs/graphql';
import { IBaseUserInfo } from './base/baseUser.model';

export class UserSignUp implements IUserSignUp {
	password: string;
	name: string;
	@ApiHideProperty() avatarPath?: string;
	email: string;
	@ApiHideProperty() id?: string;
}

export class UserLogIn implements IUserLogIn {
	password: string;
	email: string;
}

export class UserAuthencation implements IUserAuthentication {
	password: string;
}

@InputType()
export class FindUser implements IUserInfo, IBaseUserInfo {
	@Field({ nullable: true }) name: string;
	@Field({ nullable: true }) avatarPath?: string;
	@Field({ nullable: true }) email: string;
	@Field({ nullable: true }) id: string;
	@Field({ nullable: true }) lastLogin: Date;
	@Field({ nullable: true }) isActive: boolean;
	@Field({ nullable: true }) role: UserRole;
}
