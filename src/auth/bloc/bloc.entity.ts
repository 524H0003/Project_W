import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BeforeInsert, Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IBlocEntity, IBlocInfo, IBlocRelationships } from './bloc.model';
import { MetaData } from 'auth/guards';
import { dataHashing } from 'app/utils/auth.utils';

/**
 * Bloc Content
 */
interface IBlocContent {
	metaData: MetaData;
	lastIssue: number;
}

/**
 * Bloc entity
 */
@Entity({ name: 'auth_bloc' })
export class Bloc extends SensitiveInfomations implements IBlocEntity {
	/**
	 * Create device with infomations
	 * @param {IBlocInfo} payload - the device's infomations
	 */
	constructor(payload: IBlocInfo & Partial<IBlocRelationships>) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Relationships
	/**
	 * Bloc owner
	 */
	@ManyToOne(() => User, (_) => _.authBloc, {
		onDelete: 'CASCADE',
		nullable: true,
	})
	owner: User | null;

	// Infomations
	/**
	 * Previous bloc hash
	 */
	@Column({ nullable: true, update: false }) prev?: string;

	/**
	 * Bloc signature
	 */
	@Column({ nullable: false, default: (16).string }) private signature: string =
		(16).string;

	/**
	 * Current bloc hash
	 */
	@Column({ nullable: false, name: 'hash' }) private _hash: string;

	/**
	 * Current bloc content
	 */
	@Column({ type: 'jsonb', default: {} }) content?: IBlocContent;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() private hashBloc() {
		const { prev, content, signature, owner } = this;

		this._hash = dataHashing(
			JSON.stringify({ ...content, prev, signature, ownerId: owner?.id || '' }),
		);
	}

	get hash(): string {
		this.hashBloc();
		return this._hash;
	}

	static test(from: string) {
		return new Bloc({ content: { from } });
	}
}
