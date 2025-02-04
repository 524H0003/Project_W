import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
	DatabaseRequests,
	FindOptionsWithCustom,
} from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { InterfaceCasting } from 'app/utils/utils';
import {
	IBaseUserInfoKeys,
	IEnterpriseAssignKeys,
	IEnterpriseKeys,
} from 'build/models';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';

/**
 * Enterprise service
 */
@Injectable()
export class EnterpriseService extends DatabaseRequests<Enterprise> {
	/**
	 * Initiate enterprise service
	 */
	constructor(
		@InjectRepository(Enterprise) repo: Repository<Enterprise>,
		@Inject(forwardRef(() => AppService)) public svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign enterprise
	 * @param {IEnterpriseAssign} input - enterprise assign form
	 * @param {MulterFile} avatar - user's avatar
	 * @return {Promise<Enterprise>}
	 */
	async assign(
		input: IEnterpriseAssign,
		avatar: MulterFile,
	): Promise<Enterprise> {
		const save = async (
			entity: DeepPartial<Enterprise>,
			options?: SaveOptions,
		): Promise<Enterprise> => {
			entity = InterfaceCasting.quick(entity, IEnterpriseKeys);
			const baseUser = await this.svc.baseUser.assign(entity.baseUser);
			return this.save({ ...entity, baseUser }, options);
		};

		input = InterfaceCasting.quick(input, [
			...IEnterpriseAssignKeys,
			...IBaseUserInfoKeys,
		]);

		const result = await save({
			...input,
			baseUser: {
				...InterfaceCasting.quick(input, IBaseUserInfoKeys),
				avatarPath: avatar
					? (
							await this.svc.file.assign(avatar, null, {
								fileName: `${input.name}.${input.industry}.logo`,
							})
						).path
					: undefined,
			},
		});

		return new Enterprise({ ...result, ...result.baseUser });
	}

	/**
	 * Modify enterprise
	 * @param {string} entityId - enterprise's id
	 * @param {DeepPartial<Enterprise>} updatedEntity - modified enterprise
	 * @return {Promise<Enterprise>}
	 */
	async modify(
		entityId: string,
		updatedEntity: DeepPartial<Enterprise>,
	): Promise<Enterprise> {
		await this.update({ baseUser: { id: entityId } }, updatedEntity);
		return this.id(entityId);
	}

	/**
	 * Remove enterprise
	 * @param {string} entityId - enterprise's id
	 */
	async remove(entityId: string) {
		await this.delete({ baseUser: { id: entityId } });
		await this.svc.baseUser.remove(entityId);
	}

	/**
	 * Find enterprise with id
	 * @param {string} id - enterprise's id
	 * @return {Promise<Enterprise>}
	 */
	id(
		id: string,
		options?: FindOptionsWithCustom<Enterprise>,
	): Promise<Enterprise> {
		return this.findOne({ ...options, baseUser: { id } });
	}
}
