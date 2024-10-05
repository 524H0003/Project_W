import { SensitiveInfomations } from 'app/utils/typeorm.utils';
import { Device } from 'auth/device/device.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { ISession } from './session.model';

@Entity()
export class Session extends SensitiveInfomations implements ISession {
	constructor(input: ISession) {
		super();
		Object.assign(this, input);
	}

	// Relationships
	@ManyToOne(() => Device, (_: Device) => _.sessions)
	@JoinColumn({ name: 'device_id' })
	device: Device;

	@Column() parrent: string;

	@Column({ nullable: true }) child: string;

	// Infomations
	@Column() useTimeLeft: number;
}