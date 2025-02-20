import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BeforeInsert, Column, Entity } from 'typeorm';
import { IBlocEntity, IBlocInfo } from './bloc.model';
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
	constructor(payload: IBlocInfo) {
		super();

		if (payload) Object.assign(this, payload);
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
	@Column({ nullable: false }) private signature: string = (16).string;

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
	@Column({ type: 'jsonb', default: {} }) content?: IBlocContent;

	// Methods
	/**
	 * Hashing bloc
	 */
	@BeforeInsert() private hashBloc() {
		const { prev, content, signature, ownerId, lastIssue } = this;

		return (this.hash = dataHashing(
			JSON.stringify({
				...content,
				lastIssue,
				prev,
				signature,
				ownerId,
			}),
		));
	}

	static test(from: string) {
		return new Bloc({ content: { from } });
	}
}
