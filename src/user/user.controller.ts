import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from './user.entity';
import { UserService } from './user.service';
import { CurrentUser } from 'auth/auth.guard';

@Controller('user')
export class UserController {
	constructor(private usrSvc: UserService) {}

	@Post('')
	@UseGuards(AuthGuard('access'))
	getUser(@CurrentUser() usr: User) {
		if (usr) return new User(usr).info;
	}
}
