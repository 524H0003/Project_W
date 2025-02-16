import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserInfoKeys,
	IUserAuthenticationKeys,
	IUserInfoKeys,
	IUserSensitiveKeys,
} from 'build/models';
import {
	BaseEntity,
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	OneToMany,
} from 'typeorm';
import {
	IUserAuthentication,
	IUserEntity,
	UserRole,
	IUserInfo,
	IUserRecieve,
	IUserSensitive,
} from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { EventParticipator } from 'event/participator/participator.entity';
import { File } from 'file/file.entity';
import { hashing } from 'app/utils/auth.utils';
import { BaseUser } from 'app/app.entity';
import { IBaseUserInfo } from 'app/app.model';
import { decode, JwtPayload } from 'jsonwebtoken';
import { IsStrongPassword } from 'class-validator';
import { Bloc } from 'auth/bloc/bloc.entity';

/**
 * User entity
 */
@ObjectType()
@Entity({ name: 'User' })
export class User extends BaseEntity implements IUserEntity {
	/**
	 * @param {object} payload - the user's infomations
	 */
	constructor(payload: IUserAuthentication & IUserSensitive & IBaseUserInfo) {
		super();

		if (payload) {
			this.baseUser = new BaseUser(
				InterfaceCasting.quick(payload, IBaseUserInfoKeys),
			);
			Object.assign(
				this,
				InterfaceCasting.quick(payload, [
					...IUserAuthenticationKeys,
					...IUserSensitiveKeys,
				]),
			);
		}
	}

	/**
	 * The hashed password
	 */
	@Column({ name: 'password_hash' })
	hashedPassword: string;

	// Core Entity
	/**
	 * Base user
	 */
	@Column(() => BaseUser, { prefix: false }) baseUser: BaseUser;

	// Relationships
	/**
	 * User's device logged in
	 */
	@OneToMany(() => Bloc, (_: Bloc) => _.owner, { onDelete: 'CASCADE' })
	authBloc: Bloc[];

	/**
	 * User uploaded files
	 */
	@OneToMany(() => File, (_) => _.fileCreatedBy, { onDelete: 'CASCADE' })
	uploadFiles: File[];

	/**
	 * User participated events
	 */
	@OneToMany(
		() => EventParticipator,
		(_: EventParticipator) => _.participatedBy,
		{ onDelete: 'CASCADE' },
	)
	participatedEvents: EventParticipator[];

	/**
	 * User notifications
	 */
	@OneToMany(() => Reciever, (_: Reciever) => _.toUser, { onDelete: 'CASCADE' })
	recievedNotifications: Reciever[];

	// Infomations
	/**
	 * User's role
	 */
	@Field(() => UserRole)
	@Column({
		name: 'role',
		type: 'enum',
		enum: UserRole,
		enumName: 'user_role',
		default: UserRole.undefined,
	})
	role: UserRole;

	/**
	 * User's password
	 * ! WARNING: Weak password validation
	 */
	@IsStrongPassword({
		minLength: 1, // 16
		minLowercase: 0, // 1
		minUppercase: 0, // 1
		minNumbers: 0, // 1
		minSymbols: 0, // 1
	})
	password: string;

	/**
	 * User last login
	 */
	@Column({
		name: 'last_login',
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
	})
	lastLogin: Date;

	/**
	 * User active status
	 */
	@Column({ name: 'is_active', default: false }) isActive: boolean;

	// Embedded Entity
	/**
	 * Entity black box
	 */
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;

	// Methods
	/**
	 * Hash the current password
	 */
	@BeforeInsert()
	@BeforeUpdate()
	private async hashingPassword() {
		if (this.password)
			this.hashedPassword = await hashing(this.password, {
				parallelism: 3 + (3).random,
				memoryCost: 60000 + (6000).random,
				timeCost: 3 + (3).random,
				hashLength: 60 + (60).random,
			});

		delete this.password;
	}
	/**
	 * A function return user's public infomations
	 * @return {IUserInfo} User's public infomations
	 */
	get info(): IUserInfo {
		return {
			...InterfaceCasting.quick(this, IUserInfoKeys),
			...InterfaceCasting.quick(this.baseUser, IBaseUserInfoKeys),
		};
	}

	/**
	 * Get user's id
	 * @return {string}
	 */
	get id(): string {
		return this.baseUser.id;
	}

	/**
	 * Test entity
	 */
	static test(from: string, options?: { email?: string }) {
		const baseUser = BaseUser.test(
			from,
			options?.email || (20).string + '@lmao.com',
		);
		return new User({
			...baseUser,
			password: from + (20).string + 'aA1!',
			role: UserRole.undefined,
		});
	}
}

/**
 * User recieve infomations
 */
export class UserRecieve implements IUserRecieve {
	/**
	 * Quick user recieve initiation
	 * @param {object} payload - User recieve infomations
	 */
	constructor(payload: Partial<IUserRecieve>) {
		Object.assign(this, payload);
	}

	/**
	 * User access token
	 */
	accessToken: string;

	/**
	 * User refresh token
	 */
	refreshToken: string;

	/**
	 * Server's response
	 */
	response: string | IUserInfo;

	/**
	 * Jwt payload
	 */
	get payload(): JwtPayload {
		return (decode(this.accessToken) as JwtPayload) || { exp: 0, iat: 0 };
	}

	/**
	 * Test entity
	 */
	static get test() {
		return new UserRecieve({
			accessToken: (10).string,
			refreshToken: (10).string,
		});
	}
}
