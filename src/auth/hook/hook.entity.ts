import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity, ManyToOne } from 'typeorm';
import { IHook } from './hook.model';
import { BlackBox } from 'app/utils/model.utils';
import { User } from 'user/user.entity';

@Entity({ name: 'auth_hook' })
export class Hook extends SensitiveInfomations implements IHook {
	constructor(input: IHook) {
		super();
		Object.assign(this, input);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.hooks)
	from: User;

	// Infomations
	@Column() signature: string;

	@Column({ default: false }) isUsed: boolean;

	@Column() mtdt: string;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
