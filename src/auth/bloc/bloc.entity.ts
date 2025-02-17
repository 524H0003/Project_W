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
	owner: User;

	// Infomations
	/**
	 * Previous bloc hash
	 */
	@Column({ nullable: true, update: false }) prev?: string;

	/**
	 * Current bloc hash
	 */
	@Column({ nullable: false }) hash?: string;

	/**
	 * Current bloc content
	 */
	@Column({ type: 'jsonb', default: {} }) content?: IBlocContent;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() private hashBloc() {
		const { prev, id, content } = this;

		this.hash = dataHashing(JSON.stringify({ ...content, prev, id }));
	}

	static test(from: string) {
		return new Bloc({ content: { from } });
	}
}
