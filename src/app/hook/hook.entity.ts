import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IHook } from './hook.model';
import { BlackBox } from 'app/utils/model.utils';
import { BaseUser } from 'app/app.entity';
import { MetaData } from 'auth/guards';

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
	@Column({ type: 'jsonb' }) mtdt: MetaData;

	/**
	 * Addition infomations
	 */
	@Column({ type: 'jsonb', default: {} }) note: object;

	// Embedded Entity
	/**
	 * Entity black box
	 */
	@Column(() => BlackBox, { prefix: false }) blackBox: BlackBox;
}
