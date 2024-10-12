import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IHook } from './hook.model';
import { BlackBox } from 'app/utils/model.utils';
import { User } from 'user/user.entity';

/**
 * Hook entity
 */
@Entity({ name: 'auth_hook' })
export class Hook extends SensitiveInfomations implements IHook {
	/**
	 * Create hook with infomations
	 * @param {IHook} input - the hook's infomations
	 */
	constructor(input: IHook) {
		super();
		Object.assign(this, input);
	}

	// Relationships
	/**
	 * Hook from user
	 */
	@ManyToOne(() => User, (_: User) => _.hooks)
	from: User;

	// Infomations
	/**
	 * Hook's signature
	 */
	@Column() signature: string;

	/**
	 * If hook used
	 */
	@Column({ default: false }) isUsed: boolean;

	/**
	 * Client's metadata
	 */
	@Column() mtdt: string;

	// Embedded Entity
	/**
	 * @ignore
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
