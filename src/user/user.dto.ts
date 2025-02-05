import { ApiHideProperty } from '@nestjs/swagger';
import { IUserAuthentication, IUserLogIn, IUserSignUp } from './user.model';

export class UserSignUp implements IUserSignUp {
	password: string;
	name: string;
	@ApiHideProperty()
	avatarPath?: string;
	email: string;
	@ApiHideProperty()
	id?: string;
}

export class UserLogIn implements IUserLogIn {
	password: string;
	email: string;
}

export class UserAuthencation implements IUserAuthentication {
	password: string;
}
