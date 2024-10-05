import { Field, ObjectType } from '@nestjs/graphql';
import { hash } from 'app/utils/auth.utils';
import { BlackBox } from 'app/utils/model.utils';
import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { Device } from 'auth/device/device.entity';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { IFile } from 'file/file.model';
import { IUserInfoKeys } from 'models';
import { Column, Entity, OneToMany, TableInheritance } from 'typeorm';
import { IUser, IUserAuthentication, IUserInfo, UserRole } from './user.model';
import { Reciever } from 'notification/reciever/reciever.entity';
import { File } from 'file/file.entity';
import { EventParticipator } from 'event/participator/participator.entity';

@ObjectType()
@Entity({ name: 'User' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends SensitiveInfomations implements IUser {
	constructor(
		payload: Omit<IUserInfo, 'avatarPath' | 'role'> & IUserAuthentication,
	) {
		super();
		Object.assign(this, payload);
	}

	@Column({ name: 'password_hash' })
	private _hashedPassword: string;

	get hashedPassword() {
		if (this.password || this._hashedPassword) {
			if (this._hashedPassword) return this._hashedPassword;
			return (this._hashedPassword = hash(this.password));
		}
		return this._hashedPassword;
	}

	set hashedPassword(i: any) {}

	// Relationships
	@OneToMany(() => Device, (_: Device) => _.owner)
	devices?: Device[];

	@OneToMany(() => File, (_) => _.createdBy)
	uploadFiles?: IFile[];

	@OneToMany(
		() => EventParticipator,
		(_: EventParticipator) => _.participatedBy,
	)
	participatedEvents: EventParticipator[];

	@OneToMany(() => Reciever, (_: Reciever) => _.to)
	recievedNotifications: Reciever[];

	// Infomations
	@Field()
	@Column({
		default: 'defaultUser.server.jpg',
		name: 'image_path',
		type: 'text',
	})
	avatarPath: string;

	@IsString()
	@Field()
	@Column({ name: 'full_name', type: 'text' })
	fullName: string;

	@IsEmail()
	@Field()
	@Column({ name: 'email', type: 'text' })
	email: string;

	@Field(() => UserRole)
	@Column({
		name: 'role',
		type: 'enum',
		enum: UserRole,
		enumName: 'user_role',
		default: UserRole.undefined,
	})
	role: UserRole;

	@IsStrongPassword({
		minLength: 16,
		minLowercase: 1,
		minUppercase: 1,
		minNumbers: 1,
		minSymbols: 1,
	})
	password: string;

	@Column({
		name: 'last_login',
		type: 'timestamp with time zone',
		default: () => 'CURRENT_TIMESTAMP',
	})
	lastLogin: Date;

	@Column({ name: 'is_active', default: false })
	isActive: boolean;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

	// Methods
	get info() {
		return InterfaceCasting.quick(this, IUserInfoKeys);
	}

	static test(from: string) {
		const n = new User({
			email: (20).alpha + '@gmail.com',
			password: 'Aa1!000000000000',
			fullName: from,
		});
		if (n.hashedPassword) return n;
	}
}
