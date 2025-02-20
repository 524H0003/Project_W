import { Column, Entity, OneToMany } from 'typeorm';
import { SensitiveInfomations } from './utils/typeorm.utils';
import { IBaseUserEntity, IBaseUserInfo } from './app.model';
import { InterfaceCasting } from './utils/utils';
import { Hook } from './hook/hook.entity';
import { IBaseUserInfoKeys } from 'build/models';

/**
 * Base user
 */
@Entity({ name: 'app_user' })
export class BaseUser extends SensitiveInfomations implements IBaseUserEntity {
	constructor(payload: IBaseUserInfo) {
		super();
		if (payload) {
			payload = InterfaceCasting.quick(payload, IBaseUserInfoKeys) as BaseUser;
			Object.assign(this, payload);
		}
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
}
