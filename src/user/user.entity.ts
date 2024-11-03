import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { Device } from 'auth/device/device.entity';
import { IFile } from 'file/file.model';
import { IBaseUserKeys, IUserAuthenticationKeys, IUserInfoKeys } from 'models';
import { Column, Entity, OneToMany } from 'typeorm';
import {
	IUserAuthentication,
	IUserClass,
	IUserInfo,
	UserRole,
} from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { EventParticipator } from 'event/participator/participator.entity';
import { File } from 'file/file.entity';
import { Hook } from 'app/hook/hook.entity';
import { hash } from 'app/utils/auth.utils';
import { BaseUser } from 'app/app.entity';
import { IBaseUser } from 'app/app.model';

/**
 * User entity
 */
@ObjectType()
@Entity({ name: 'User' })
export class User implements IUserClass {
	/**
	 * @param {object} payload - the user's infomations
	 */
	constructor(payload: IUserAuthentication & IBaseUser) {
		if (payload) {
			this.user = new BaseUser(InterfaceCasting.quick(payload!, IBaseUserKeys));
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
			return (this._hashedPassword = hash(this.password));
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
	user: BaseUser;

	// Relationships
	/**
	 * User's device logged in
	 */
	@OneToMany(() => Device, (_: Device) => _.owner, { onDelete: 'CASCADE' })
	devices: Device[];

	/**
	 * User uploaded files
	 */
	@OneToMany(() => File, (_) => _.createdBy, { onDelete: 'CASCADE' })
	uploadFiles: IFile[];

	/**
	 * User hooks
	 */
	@OneToMany(() => Hook, (_: Hook) => _.from, { onDelete: 'CASCADE' })
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
	@OneToMany(() => Reciever, (_: Reciever) => _.to, { onDelete: 'CASCADE' })
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
			...InterfaceCasting.quick(this.user, IBaseUserKeys),
		};
	}

	/**
	 * @ignore
	 */
	static test(from: string, options?: { email?: string; password?: string }) {
		const {
				email = ((20).alpha + '@gmail.com').toLowerCase(),
				password = 'Aa1!000000000000',
			} = options || {},
			n = new User({ email, password, name: from });
		if (n.hashedPassword) return n;
	}
}
