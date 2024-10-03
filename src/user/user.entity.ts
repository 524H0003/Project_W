import { Field, HideField, ObjectType } from '@nestjs/graphql';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';
import { Device } from 'device/device.entity';
import { EventParticipator } from 'event/event.entity';
import { File } from 'file/file.entity';
import { IFile } from 'file/file.model';
import { IUserInfoKeys } from 'models';
import { Column, Entity, OneToMany, TableInheritance } from 'typeorm';
import { hash } from 'utils/auth.utils';
import { BlackBox } from 'utils/model.utils';
import { SensitiveInfomations } from 'utils/typeorm.utils';
import { InterfaceCasting } from 'utils/utils';
import { IUser, IUserAuthentication, IUserInfo, UserRole } from './user.model';

@ObjectType()
@Entity({ name: 'User' })
@TableInheritance({ column: { type: 'varchar', name: 'type' } })
export class User extends SensitiveInfomations implements IUser {
	constructor(payload: IUserInfo & IUserAuthentication) {
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

	// Infomations
	@Field()
	@Column({ name: 'image_path', default: 'defaultUser.server.jpg' })
	avatarPath: string;

	@IsString()
	@Field()
	@Column({ name: 'full_name' })
	fullName: string;

	@IsEmail()
	@Field()
	@Column({ name: 'email' })
	email: string;

	@Field(() => [UserRole])
	@Column({
		name: 'role',
		type: 'enum',
		enum: UserRole,
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

	@Column({ name: 'last_login' })
	lastLogin: Date;

	// Status
	@Column({ name: 'is_active' })
	isActive: boolean;

	// Embedded Entity
	@HideField()
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;

	// Methods
	get info() {
		return InterfaceCasting.quick(this, IUserInfoKeys);
	}

	static test(from: string) {
		const n = new User({
			avatarPath: null,
			email: (20).alpha + '@gmail.com',
			password: 'Aa1!000000000000',
			fullName: from,
			role: UserRole.student,
		});
		if (n.hashedPassword) return n;
	}
}
