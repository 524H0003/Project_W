import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DatabaseRequests,
	NonFunctionProperties,
} from 'app/utils/typeorm.utils';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './user.entity';
import { IUserEntity, UserRole } from './user.model';
import { AppService } from 'app/app.service';
import { InterfaceCasting } from 'app/utils/utils';
import { IUserRelationshipKeys } from 'build/models';

/**
 * Services for user
 */
@Injectable()
export class UserService extends DatabaseRequests<User> {
	/**
	 * Initiate user service
	 */
	constructor(
		@InjectRepository(User) repo: Repository<User>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
	) {
		super(repo, User);
	}

	/**
	 * Assign new user
	 * @param {User} entity - the assigning user
	 */
	async assign({
		baseUser,
		role,
		password,
	}: NonFunctionProperties<IUserEntity>): Promise<User> {
		const assignedBaseUser = await this.svc.baseUser.assign(baseUser),
			user = new User({ baseUser: assignedBaseUser, role, password });

		return this.save(user);
	}

	/**
	 * Modify user
	 * @param {string} entityId - user's id
	 * @param {DeepPartial<User>} updatedEntity - modified user
	 */
	async modify(entityId: string, updatedEntity: DeepPartial<User>) {
		await this.svc.baseUser.modify(entityId, updatedEntity.baseUser);
		updatedEntity = InterfaceCasting.delete(
			updatedEntity,
			IUserRelationshipKeys,
		);
		if (!Object.keys(updatedEntity).length) return;
		await this.update({ id: entityId }, updatedEntity);
	}

	/**
	 * Remove user
	 * @param {string} entityId - user's id
	 */
	async remove(entityId: string) {
		await this.delete({ baseUser: { id: entityId } });
		await this.svc.baseUser.remove(entityId);
	}

	/**
	 * Find user with email
	 * @param {string} input - user's email
	 */
	email(input: string): Promise<User> {
		return this.findOne({ baseUser: { email: input.lower } });
	}

	/**
	 * Find user by id
	 * @param {string} id - user's id
	 * @param {ExtendOptions} options - function options
	 * @return {Promise<User>}
	 */
	id(id: string): Promise<User> {
		return this.findOne({ baseUser: { id }, deep: 2 });
	}

	/**
	 * Updating user's role
	 * @param {string} id - the user's id
	 * @param {UserRole} updateRole - the role update to the user
	 */
	async updateRole(id: string, updateRole: UserRole) {
		await this.modify(id, { role: updateRole });
	}

	/**
	 * Find full user infomations
	 * @param {string} id - user id
	 */
	async info(id: string): Promise<object> {
		if (!id) throw new ServerException('Invalid', 'ID', '');

		const student = await this.svc.student.id(id),
			employee = await this.svc.employee.id(id),
			faculty = await this.svc.faculty.id(id);

		switch (false) {
			case student.isNull():
				return student.info;

			case employee.isNull():
				return employee.info;

			case faculty.isNull():
				return faculty.info;

			default:
				return (await this.id(id)).info;
		}
	}
}
