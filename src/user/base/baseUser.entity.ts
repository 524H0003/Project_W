import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import { IBaseUserInfoKeys } from 'build/models';
import { IBaseUserEntity, IBaseUserInfo } from './baseUser.model';
import {
	GeneratedId,
	type NonFunctionProperties,
} from 'app/typeorm/typeorm.utils';
import { Hook } from 'app/hook/hook.entity';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Base user
 */
@CacheControl({ maxAge: (2).m2s })
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
		if (typeof this.email == 'string') this.email = this.email.lower;
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
