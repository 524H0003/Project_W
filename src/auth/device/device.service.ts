import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import {
	DeepPartial,
	DeleteResult,
	FindOptionsWhere,
	Repository,
	SaveOptions,
} from 'typeorm';
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
	 * @param {DeepPartial<Device>} entity - assigning device
	 * @param {SaveOptions} options - function's option
	 * @return {Promise<Device>}
	 */
	assign(entity: DeepPartial<Device>, options?: SaveOptions): Promise<Device> {
		return this.save(entity, options);
	}

	/**
	 * Remove device
	 * @param {FindOptionsWhere<Device>} criteria - deleting device
	 * @return {Promise<DeleteResult>}
	 */
	async remove(criteria: FindOptionsWhere<Device>): Promise<DeleteResult> {
		return this.delete(criteria);
	}
}
