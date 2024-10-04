import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Session } from 'auth/session/session.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { User } from 'user/user.entity';
import { IDevice } from './device.model';

@Entity()
export class Device extends SensitiveInfomations implements IDevice {
	constructor(payload: IDevice) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	@ManyToOne(() => User, (_: User) => _.devices)
	owner: User;

	@OneToMany(() => Session, (_: Session) => _.device)
	sessions: Session[];

	@Column({ nullable: true }) child: string;

	// Infomations
	@Column() hashedUserAgent: string;
}
