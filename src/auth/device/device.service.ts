import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { Device } from './device.entity';

/**
 * Device service
 */
@Injectable()
export class DeviceService extends DatabaseRequests<Device> {
	/**
	 * @ignore
	 */
	constructor(@InjectRepository(Device) repo: Repository<Device>) {
		super(repo);
	}

	/**
	 * Assign new device
	 */
	assign(entity: DeepPartial<Device>, options?: SaveOptions): Promise<Device> {
		return this.save(entity, options);
	}
}
