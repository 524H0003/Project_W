import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserKeys, IEnterpriseAssignKeys, IEnterpriseKeys } from 'models';
import { AppService } from 'app/app.service';

/**
 * Enterprise service
 */
@Injectable()
export class EnterpriseService extends DatabaseRequests<Enterprise> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(Enterprise) repo: Repository<Enterprise>,
		@Inject(forwardRef(() => AppService))
		public svc: AppService,
	) {
		super(repo);
	}

	/**
	 * Assign enterprise
	 * @param {IEnterpriseAssign} input - enterprise assign form
	 * @param {Express.Multer.File} avatar - user's avatar
	 * @return {Promise<Enterprise>}
	 */
	async assign(
		input: IEnterpriseAssign,
		avatar: Express.Multer.File,
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
			...IBaseUserKeys,
		]);

		const avatarFile = await this.svc.file.assign(avatar, null, {
				fileName: `${input.name}.${input.industry}.logo`,
			}),
			result = await save({
				...input,
				baseUser: {
					...InterfaceCasting.quick(input, IBaseUserKeys),
					avatarPath: avatarFile?.path,
				},
			});

		return new Enterprise({ ...result, ...result.baseUser });
	}

	/**
	 * Find enterprise with id
	 * @param {string} id - enterprise's id
	 * @return {Promise<Enterprise>}
	 */
	id(id: string): Promise<Enterprise> {
		return this.findOne({ baseUser: { id } });
	}
}
