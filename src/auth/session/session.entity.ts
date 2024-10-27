import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Device } from 'auth/device/device.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ISession } from './session.model';

/**
 * Session entity
 */
@Entity({ name: 'auth_session' })
export class Session extends SensitiveInfomations implements ISession {
	/**
	 * @ignore
	 */
	constructor(input: ISession) {
		super();
		Object.assign(this, input);
	}

	// Relationships
	/**
	 * Session from device
	 */
	@ManyToOne(() => Device, (_: Device) => _.sessions, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'device_id' })
	device: Device;

	// Infomations
	/**
	 * Session's parrent
	 */
	@Column() parrent: string;

	/**
	 * Session's child
	 */
	@Column({ nullable: true }) child: string;

	/**
	 * Session's use time left
	 */
	@Column() useTimeLeft: number;
}
