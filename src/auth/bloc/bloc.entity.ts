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
	@Column({ nullable: false }) private signature: string = (16).string;

	/**
	 * Current bloc hash
	 */
	@Column({ nullable: false }) hash: string;

	/**
	 * Bloc last issue time
	 */
	@Column({ nullable: false }) lastIssue: number = currentTime();

	/**
	 * Current bloc content
	 */
	@Column({ type: 'jsonb', default: {} }) content?: IBlocContent;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() hashBloc() {
		const { prev, content, signature, owner, lastIssue } = this;

		return (this.hash = dataHashing(
			JSON.stringify({
				...content,
				lastIssue,
				prev,
				signature,
				ownerId: owner?.id || '',
			}),
		));
	}

	static test(from: string) {
		return new Bloc({ content: { from } });
	}
}
