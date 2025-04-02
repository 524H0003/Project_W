import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BlackBox } from 'app/utils/model.utils';
import { MetaData } from 'auth/guards';
import { InterfaceCasting } from 'app/utils/utils';
import { IHookEntity } from './hook.model';
import { IHookInfoKeys } from 'build/models';
import { BaseUser } from 'user/base/baseUser.entity';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Hook entity
 */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'auth_hook' })
export class Hook extends GeneratedId implements IHookEntity {
	/**
	 * Create hook with infomations
	 * @param {NonFunctionProperties<IHookEntity>} payload - the hook's infomations
	 */
	constructor(payload: NonFunctionProperties<IHookEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IHookInfoKeys));
		this.fromBaseUser = new BaseUser(payload.fromBaseUser);
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
