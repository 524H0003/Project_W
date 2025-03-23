import { GeneratedId, NonFunctionProperties } from 'app/utils/typeorm.utils';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { IBlocEntity } from './bloc.model';
import { dataHashing } from 'app/utils/auth.utils';
import { InterfaceCasting } from 'app/utils/utils';
import { IBlocInfoKeys } from 'build/models';
import { CacheControl } from 'app/graphql/graphql.decorator';

/**
 * Bloc entity
 */
@CacheControl({ maxAge: (1).m2s })
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
	}

	// Infomations
	/**
	 * Bloc owner id
	 */
	@Column({ nullable: true, update: false }) ownerId: string | null;

	/**
	 * Previous bloc hash
	 */
	@Column({ nullable: true, update: false }) prev?: string;

	/**
	 * Bloc signature
	 */
	@Column({ nullable: false }) private signature: string;

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
	@Column({ nullable: true }) metaData?: string;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() private hashBloc() {
		this.signature = (16).string;

		const { prev, metaData, signature, ownerId, lastIssue } = this;

		return (this.hash = dataHashing(
			JSON.stringify({ metaData, lastIssue, prev, signature, ownerId }),
		));
	}

	static test(from: string) {
		return new Bloc({ metaData: from });
	}
}
