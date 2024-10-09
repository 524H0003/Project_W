import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Column, Entity } from 'typeorm';
import { IHook } from './hook.model';
import { BlackBox } from 'app/utils/model.utils';

@Entity({ name: 'auth_hook' })
export class Hook extends SensitiveInfomations implements IHook {
	constructor(input: IHook) {
		super();
		Object.assign(this, input);
	}

	// Infomations
	@Column() signature: string;

	@Column({ default: false }) isUsed: boolean;

	// Embedded Entity
	@Column(() => BlackBox, { prefix: false })
	blackBox: BlackBox;
}
