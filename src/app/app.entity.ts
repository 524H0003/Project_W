import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { GeneratedId, NonFunctionProperties } from './utils/typeorm.utils';
import { IBaseUserEntity, IBaseUserInfo } from './app.model';
import { InterfaceCasting } from './utils/utils';
import { Hook } from './hook/hook.entity';
import { IBaseUserInfoKeys } from 'build/models';

/**
 * Base user
 */
@Entity({ name: 'app_user' })
export class BaseUser extends GeneratedId implements IBaseUserEntity {
	/**
	 * @param {NonFunctionProperties<IBaseUserEntity>} payload - entity payload
	 */
	constructor(payload: NonFunctionProperties<IBaseUserEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IBaseUserInfoKeys));
		this.hooks = payload.hooks?.map((i) => new Hook(i));
		this.email = payload.email.lower;
	}

	// Relationships
	/**
	 * Base user hooks
	 */
	@OneToMany(() => Hook, (_: Hook) => _.fromBaseUser, { onDelete: 'CASCADE' })
	hooks: Hook[];

	// Infomations
	/**
	 * Base user email address
	 */
	@Column({ type: 'text' }) email: string;

	/**
	 * Base user name
	 */
	@Column({ type: 'text' }) name: string;

	/**
	 * Base user's avatar path
	 */
	@Column({
		default: 'defaultUser.server.jpg',
		name: 'image_path',
		type: 'text',
	})
	avatarPath?: string;

	// Methods
	/**
	 * Lower cassing email
	 */
	@BeforeUpdate() @BeforeInsert() private lowerCassingEmail() {
		if (this.email) this.email = this.email.lower;
	}

	/**
	 * A function return user's public infomations
	 */
	get info(): IBaseUserInfo {
		return InterfaceCasting.quick(this, IBaseUserInfoKeys);
	}

	static test(from: string, email?: string) {
		return new BaseUser({
			email: email || (20).string + '@lmao.com',
			name: from + '_' + (5).string,
		});
	}

	isNull() {
		return Object.keys(this).length == 0;
	}
}
