import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { IUserAuthenticationKeys, IUserInfoKeys } from 'build/models';
import {
	BeforeInsert,
	BeforeUpdate,
	Column,
	Entity,
	JoinColumn,
	OneToMany,
	OneToOne,
} from 'typeorm';
import {
	IUserEntity,
	UserRole,
	IUserInfo,
	IUserRecieve,
	IResponse,
} from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { EventParticipator } from 'event/participator/participator.entity';
import { File } from 'file/file.entity';
import { passwordHashing } from 'app/utils/auth.utils';
import { BaseUser } from 'app/app.entity';
import { IBaseUserInfo } from 'app/app.model';
import { decode, JwtPayload } from 'jsonwebtoken';
import { IsStrongPassword } from 'class-validator';
import { NonFunctionProperties, ParentId } from 'app/utils/typeorm.utils';
import { ApiHideProperty } from '@nestjs/swagger';

/**
 * User entity
 */
@ObjectType()
@Entity({ name: 'User' })
export class User extends ParentId implements IUserEntity {
	/**
	 * @param {NonFunctionProperties<IUserEntity>} payload - the user's infomations
	 */
	constructor(payload: NonFunctionProperties<IUserEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(
			this,
			InterfaceCasting.quick(payload, [
				...IUserInfoKeys,
				...IUserAuthenticationKeys,
				'hashedPassword',
			]),
		);
		this.baseUser = new BaseUser(payload.baseUser);
		this.uploadFiles = payload.uploadFiles?.map((i) => new File(i));
		this.participatedEvents = payload.participatedEvents?.map(
			(i) => new EventParticipator(i),
		);
		this.recievedNotifications = payload.recievedNotifications?.map(
			(i) => new Reciever(i),
		);
	}

	/**
	 * The hashed password
	 */
	@Column({ name: 'password_hash' }) hashedPassword: string;

	// Core Entity
	/**
	 * Base user
	 */
	@OneToOne(() => BaseUser, { eager: true, onDelete: 'CASCADE' })
	@JoinColumn()
	baseUser: BaseUser;

	// Relationships

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
	@BeforeInsert() @BeforeUpdate() private async hashingPassword() {
		if (this.password)
			this.hashedPassword = await passwordHashing(this.password, {
				parallelism: 3 + (3).random,
				memoryCost: 60000 + (6000).random,
				timeCost: 3 + (3).random,
				hashLength: 60 + (60).random,
			});

		delete this.password;
	}

	public static changePassword(password: string) {
		// @ts-ignore
		const output = new this({});
		output.password = password;

		return output;
	}

	/**
	 * A function return user's public infomations
	 */
	get info(): IUserInfo & IBaseUserInfo {
		return {
			...InterfaceCasting.quick(this, IUserInfoKeys),
			...this.baseUser.info,
		};
	}

	/**
	 * Get parent's id
	 */
	get pid(): string {
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
			baseUser,
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
	@ApiHideProperty() accessToken: string;

	/**
	 * User refresh token
	 */
	@ApiHideProperty() refreshToken: string;

	/**
	 * Server's response
	 */
	@ApiHideProperty() response: IResponse;

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
