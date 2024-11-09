import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { Device } from 'auth/device/device.entity';
import { IFile } from 'file/file.model';
import { IBaseUserKeys, IUserAuthenticationKeys, IUserInfoKeys } from 'models';
import { BaseEntity, Column, Entity, OneToMany } from 'typeorm';
import {
	IUserAuthentication,
	IUserEntity,
	UserRole,
	IUserInfo,
	IUserRecieve,
} from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { EventParticipator } from 'event/participator/participator.entity';
import { File } from 'file/file.entity';
import { Hook } from 'app/hook/hook.entity';
import { hash } from 'app/utils/auth.utils';
import { BaseUser } from 'app/app.entity';
import { IBaseUser } from 'app/app.model';
import { decode, JwtPayload } from 'jsonwebtoken';

/**
 * User entity
 */
@ObjectType()
@Entity({ name: 'User' })
export class User extends BaseEntity implements IUserEntity {
	/**
	 * @param {object} payload - the user's infomations
	 */
	constructor(payload: IUserAuthentication & IBaseUser) {
		super();

		if (payload) {
			this.baseUser = new BaseUser(
				InterfaceCasting.quick(payload!, IBaseUserKeys),
			);
			Object.assign(
				this,
				InterfaceCasting.quick(payload!, IUserAuthenticationKeys),
			);
		}
	}

	/**
	 * The hashed password
	 */
	@Column({ name: 'password_hash' })
	private _hashedPassword: string;

	/**
	 * @ignore
	 */
	get hashedPassword() {
		if (this.password) {
			this._hashedPassword = hash(this.password);
			delete this.password;
			return this._hashedPassword;
		}
		return this._hashedPassword;
	}

	/**
	 * @ignore
	 */
	set hashedPassword(i: any) {}

	// Core Entity
	/**
	 * Base user
	 */
	@Column(() => BaseUser, { prefix: false })
	baseUser: BaseUser;

	// Relationships
	/**
	 * User's device logged in
	 */
	@OneToMany(() => Device, (_: Device) => _.owner, { onDelete: 'CASCADE' })
	devices: Device[];

	/**
	 * User uploaded files
	 */
	@OneToMany(() => File, (_) => _.fileCreatedBy, { onDelete: 'CASCADE' })
	uploadFiles: IFile[];

	/**
	 * User hooks
	 */
	@OneToMany(() => Hook, (_: Hook) => _.fromUser, { onDelete: 'CASCADE' })
	hooks: Hook[];

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
	 */
	password: string;
	// @IsStrongPassword({	// minLength: 16,
	// minLowercase: 1,
	// minUppercase: 1,
	// minNumbers: 1,
	// minSymbols: 1,
	// })

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
	@Column({ name: 'is_active', default: false })
	isActive: boolean;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

	// Methods
	/**
	 * A function return user's public infomations
	 * @return {IUserInfo} User's public infomations
	 */
	get info(): IUserInfo {
		return {
			...InterfaceCasting.quick(this, IUserInfoKeys),
			...InterfaceCasting.quick(this.baseUser, IBaseUserKeys),
		};
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { email?: string; password?: string }) {
		const { email = (20).alpha + '@gmail.com', password = 'Aa1!000000000000' } =
			options || {};
		return new User({ email, password, name: from });
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
	accessToken: string = '';

	/**
	 * User refresh token
	 */
	refreshToken: string = '';

	/**
	 * Server's response
	 */
	response: string | IUserInfo = '';

	/**
	 * Jwt payload
	 */
	get payload(): JwtPayload {
		return (decode(this.accessToken) as JwtPayload) || { exp: 0, iat: 0 };
	}

	/**
	 * @ignore
	 */
	static get test() {
		return new UserRecieve({
			accessToken: (10).string,
			refreshToken: (10).string,
		});
	}
}
