import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { BeforeUpdate, Column, Entity, ManyToOne } from 'typeorm';
import { User } from 'user/user.entity';
import { IBlocEntity, IBlocInfo } from './bloc.model';
import { hash } from 'app/utils/auth.utils';
import { MetaData } from 'auth/guards';

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
	constructor(payload: IBlocInfo) {
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
	@Column({ default: '', update: false }) prev: string;

	/**
	 * Current bloc hash
	 */
	@Column() hash: string;

	/**
	 * Current bloc content
	 */
	@Column({ type: 'jsonb', default: {} }) content: IBlocContent;

	// Methods
	@BeforeUpdate()
	async hashBloc() {
		const { prev, id } = this;

		this.hash = await hash(JSON.stringify({ ...this.content, prev, id }));
	}

	// eslint-disable-next-line tsEslint/no-unused-vars
	static test(from: string) {}
}
