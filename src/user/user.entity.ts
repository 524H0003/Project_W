import { Field, ObjectType } from '@nestjs/graphql';
import {
	BlackBox,
	type RequireOnlyOne,
	type RequireOnlyOneRequiredRest,
} from 'app/utils/model.utils';
import {
	IUserAuthenticationKeys,
	IUserInfoKeys,
	IUserRecieveKeys,
} from 'build/models';
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
import { IsStrongPassword } from 'class-validator';
import {
	type NonFunctionProperties,
	ParentId,
} from 'app/typeorm/typeorm.utils';
import { ApiHideProperty } from '@nestjs/swagger';
import { BaseUser } from './base/baseUser.entity';
import { IBaseUserInfo } from './base/baseUser.model';
import { CacheControl } from 'app/graphql/graphql.decorator';
import { IBlocCompulsory } from 'auth/bloc/bloc.model';
import { passwordHashing } from 'auth/auth.utils';

/**
 * User entity
 */
@ObjectType()
@CacheControl({ maxAge: (2).m2s })
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

	@Field() private name: string;

	@Field() private avatarPath?: string;

	@Field() private email: string;

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
		minLength: 2, // 16
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
	@Field()
	lastLogin: Date;

	/**
	 * User active status
	 */
	@Column({ name: 'is_active', default: false }) @Field() isActive: boolean;

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
	get pid() {
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
	 * @param {RequireOnlyOneRequiredRest<UserRecieve,'HookId' | 'blocInfo' | 'isClearCookie'>} payload - User recieve infomations
	 */
	constructor(
		payload: RequireOnlyOneRequiredRest<
			UserRecieve,
			'HookId' | 'blocInfo' | 'isClearCookie'
		>,
	) {
		Object.assign(this, InterfaceCasting.quick(payload, IUserRecieveKeys));
	}

	/**
	 * Clear cookie if requested
	 */
	@ApiHideProperty() isClearCookie: boolean;

	/**
	 * Hook id
	 */
	@ApiHideProperty() HookId: string;

	/**
	 * User access token
	 */
	@ApiHideProperty() blocInfo: Required<IBlocCompulsory>;

	/**
	 * Server's response
	 */
	@ApiHideProperty() response: RequireOnlyOne<IResponse, 'message' | 'user'>;

	/**
	 * Test entity
	 */
	static get test() {
		return new UserRecieve({
			blocInfo: { hash: '', id: '' },
			response: { message: (10).string },
		});
	}
}
