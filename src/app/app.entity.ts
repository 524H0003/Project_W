import { Column, Entity } from 'typeorm';
import { SensitiveInfomations } from './utils/typeorm.utils';
import { IBaseUser } from './app.model';

/**
 * Base user
 */
@Entity({ name: 'app_user' })
export class BaseUser extends SensitiveInfomations implements IBaseUser {
	constructor(payload: IBaseUser) {
		super();
		Object.assign(this, payload);
	}

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
	static test(from: string, email?: string) {
		return new BaseUser({
			email: email || (20).string + '@lmao.com',
			name: from + '_' + (5).string,
		});
	}
}
