import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IHook } from './hook.model';
import { BlackBox } from 'app/utils/model.utils';
import { BaseUser } from 'app/app.entity';

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
	@ManyToOne(() => BaseUser, (_: BaseUser) => _.hooks, { nullable: true })
	fromBaseUser: BaseUser;

	// Infomations
	/**
	 * Hook's signature
	 */
	@Column() signature: string;

	/**
	 * Client's metadata
	 */
	@Column() mtdt: string;

	/**
	 * Addition infomations
	 */
	@Column({ nullable: true }) note: string;

	// Embedded Entity
	/**
	 * Entity black box
	 */
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
