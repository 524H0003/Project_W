import { Field, ObjectType } from '@nestjs/graphql';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { Device } from 'auth/device/device.entity';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { IFile } from 'file/file.model';
import { IUserInfoKeys } from 'models';
import { Column, Entity, OneToMany } from 'typeorm';
import { IUser, IUserAuthentication, IUserInfo, UserRole } from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { EventParticipator } from 'event/participator/participator.entity';
import { File } from 'file/file.entity';
import { Hook } from 'auth/hook/hook.entity';
import { hash } from 'app/utils/auth.utils';

/**
 * User entity
 */
@ObjectType()
@Entity({ name: 'User' })
export class User extends SensitiveInfomations implements IUser {
	/**
	 * @param {object} payload - the user's infomations
	 */
	constructor(
		payload: Omit<IUserInfo, 'avatarPath' | 'role'> & IUserAuthentication,
	) {
		super();
		Object.assign(this, payload);
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

	// Relationships
	/**
	 * User's device logged in
	 */
	@OneToMany(() => Device, (_: Device) => _.owner)
	devices: Device[];

	/**
	 * User uploaded files
	 */
	@OneToMany(() => File, (_) => _.createdBy)
	uploadFiles: IFile[];

	/**
	 * User hooks
	 */
	@OneToMany(() => Hook, (_: Hook) => _.from)
	hooks: Hook[];

	/**
	 * User participated events
	 */
	@OneToMany(
		() => EventParticipator,
		(_: EventParticipator) => _.participatedBy,
	)
	participatedEvents: EventParticipator[];

	/**
	 * User notifications
	 */
	@OneToMany(() => Reciever, (_: Reciever) => _.to)
	recievedNotifications: Reciever[];

	// Infomations
	/**
	 * User avatar path
	 */
	@Field()
	@Column({
		default: 'defaultUser.server.jpg',
		name: 'image_path',
		type: 'text',
	})
	avatarPath: string;

	/**
	 * User's full name
	 */
	@IsString()
	@Field()
	@Column({ name: 'full_name', type: 'text' })
	fullName: string;

	/**
	 * User's email address
	 */
	@IsEmail()
	@Field()
	@Column({ name: 'email', type: 'text' })
	email: string;

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
	// @IsStrongPassword({
	// minLength: 16,
	// minLowercase: 1,
	// minUppercase: 1,
	// minNumbers: 1,
	// minSymbols: 1,
	// })
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
		return InterfaceCasting.quick(this, IUserInfoKeys);
	}

	/**
	 * @ignore
	 */
	static test(from: string) {
		const n = new User({
			email: (20).alpha + '@gmail.com',
			password: 'Aa1!000000000000',
			fullName: from,
		});
		if (n.hashedPassword) return n;
	}
}
