import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Session } from 'auth/session/session.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { IDeviceEntity, IDeviceInfo } from './device.model';
import { User } from 'user/user.entity';

/**
 * Device entity
 */
@Entity({ name: 'auth_device' })
export class Device extends SensitiveInfomations implements IDeviceEntity {
	/**
	 * Create device with infomations
	 * @param {IDeviceInfo} payload - the device's infomations
	 */
	constructor(payload: IDeviceInfo) {
		super();

		if (payload) Object.assign(this, payload);
	}

	// Relationships
	/**
	 * Device's owner
	 */
	@ManyToOne(() => User, (_: User) => _.devices, { onDelete: 'CASCADE' })
	owner: User;

	/**
	 * Device's sessions
	 */
	@OneToMany(() => Session, (_: Session) => _.device, { onDelete: 'CASCADE' })
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

	// Methods
	static test(from: string) {
		return new Device({ child: '', hashedUserAgent: from + (20).string });
	}
}
