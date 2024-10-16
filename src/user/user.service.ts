import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UserRole } from './user.model';

/**
 * Services for user
 */
@Injectable()
export class UserService extends DatabaseRequests<User> {
	/**
	 * @ignore
	 */
	constructor(@InjectRepository(User) repo: Repository<User>) {
		super(repo);
	}

	/**
	 * Find user with email
	 * @param {string} input - the user's email
	 * @return {Promise<User>} the user's infomations that found
	 */
	email(input: string): Promise<User> {
		return this.findOne({ email: input.toLowerCase() });
	}

	/**
	 * Updating user's role
	 * @param {string} userId - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 * @return {Promise<User>} the user's infomations
	 */
	async updateRole(userId: string, updateRole: UserRole): Promise<User> {
		return this.update({ id: userId, role: updateRole });
	}
}
