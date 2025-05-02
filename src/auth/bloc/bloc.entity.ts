import {
	GeneratedId,
	type NonFunctionProperties,
} from 'app/typeorm/typeorm.utils';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { IBlocEntity } from './bloc.model';
import { IBlocInfoKeys } from 'build/models';
import { CacheControl } from 'app/graphql/graphql.decorator';
import { User } from 'user/user.entity';
import { type MetaData } from 'auth/guards';
import { UAParser } from 'ua-parser-js';
import { dataHashing } from 'auth/auth.utils';

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
		if (payload.owner != null) this.owner = new User(payload.owner);
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
	@BeforeInsert() private hashBloc() {
		const { prev, metaData, id, owner, lastIssue } = this;

		return (this.hash = dataHashing(
			JSON.stringify({ metaData, lastIssue, prev, id, owner: owner?.id }),
		));
	}

	static test(from: string) {
		return new Bloc({ metaData: new UAParser(from) });
	}
}
