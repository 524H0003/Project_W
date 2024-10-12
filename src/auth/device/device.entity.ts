import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Session } from 'auth/session/session.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IDevice } from './device.model';
import { User } from 'user/user.entity';

/**
 * Device entity
 */
@Entity({ name: 'auth_device' })
export class Device extends SensitiveInfomations implements IDevice {
	/**
	 * Create device with infomations
	 * @param {IDevice} payload - the device's infomations
	 */
	constructor(payload: IDevice) {
		super();
		Object.assign(this, payload);
	}

	// Relationships
	/**
	 * Device's owner
	 */
	@ManyToOne(() => User, (_: User) => _.devices)
	owner: User;

	/**
	 * Device's sessions
	 */
	@OneToMany(() => Session, (_: Session) => _.device)
	sessions: Session[];

	// Infomations
	/**
	 * Device's child
	 */
	@Column({ nullable: true }) child: string;

	/**
	 * Device's hashed useragent from client
	 */
	@Column() hashedUserAgent: string;
}
