import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
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
