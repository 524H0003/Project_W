import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';

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

	async updateRole(userId: string, updateRole: UserRole) {
		return this.update({ id: userId, role: updateRole });
	}
}
