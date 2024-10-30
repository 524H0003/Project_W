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
	@Column() email: string;

	/**
	 * Base user name
	 */
	@Column({ type: 'text', name: 'name' }) name: string;

	/**
	 * Base user's avatar path
	 */
	@Column({
		default: 'defaultUser.server.jpg',
		name: 'image_path',
		type: 'text',
	})
	avatarPath?: string;
}
