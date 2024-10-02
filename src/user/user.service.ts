import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseRequests } from 'utils/typeorm.utils';
import { User } from './user.entity';

@Injectable()
export class UserService extends DatabaseRequests<User> {
	constructor(@InjectRepository(User) repo: Repository<User>) {
		super(repo);
	}

	email(input: string) {
		return this.findOne({ email: input });
	}

	async assign(newUser: User) {
		return new User(await this.save(newUser));
	}
}
