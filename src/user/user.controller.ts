import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { User } from './user.entity';

@Controller('user')
export class UserController {
	@Post('')
	@UseGuards(AuthGuard('access'))
	getUser(@Req() req: Request) {
		if (req.user) return (req.user as User).info;
	}
}
