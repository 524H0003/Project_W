import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { IBlocEntity } from './bloc.model';
import { dataHashing } from 'app/utils/auth.utils';
import { IBlocInfoKeys } from 'build/models';
import { CacheControl } from 'app/graphql/graphql.decorator';
import { User } from 'user/user.entity';
import { MetaData } from 'auth/guards';
import { UAParser } from 'ua-parser-js';

/**
 * Bloc entity
 */
@CacheControl({ maxAge: (2).m2s })
@Entity({ name: 'auth_bloc' })
export class Bloc extends GeneratedId implements IBlocEntity {
	/**
	 * Create device with infomations
	 * @param {NonFunctionProperties<IBlocEntity>} payload - the device's infomations
	 */
	constructor(payload: NonFunctionProperties<IBlocEntity>) {
		super();
		if (!payload || !Object.keys(payload).length) return;

		Object.assign(this, InterfaceCasting.quick(payload, IBlocInfoKeys));
		this.owner = new User(payload.owner);
	}

	// Relationships
	/**
	 * Bloc owner id
	 */
	@ManyToOne(() => User, { nullable: true }) owner: User;

	// Infomations
	/**
	 * Previous bloc id
	 */
	@Column({ nullable: true, update: false }) prev?: string;

	/**
	 * Current bloc hash
	 */
	@Column({ nullable: false }) hash: string;

	/**
	 * Bloc last issue time
	 */
	@Column({ nullable: true }) lastIssue: number;

	/**
	 * Current bloc content
	 */
	@Column({ type: 'jsonb', default: {} }) metaData: MetaData;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() @BeforeUpdate() private hashBloc() {
		const { prev, metaData, id, owner, lastIssue } = this;

		return (this.hash = dataHashing(
			JSON.stringify({ metaData, lastIssue, prev, id, owner: owner.id }),
		));
	}

	static test(from: string) {
		return new Bloc({ metaData: new UAParser(from) });
	}
}
