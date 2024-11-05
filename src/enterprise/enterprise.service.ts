import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, SaveOptions } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserKeys, IEnterpriseAssignKeys, IEnterpriseKeys } from 'models';
import { FileService } from 'file/file.service';
import { IBaseUser } from 'app/app.model';
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
		private fileSvc: FileService,
		private appSvc: AppService,
	) {
		super(repo);
	}

	/**
	 * Create enterprise
	 */
	protected async save(
		entity: DeepPartial<Enterprise>,
		options?: SaveOptions,
	): Promise<Enterprise> {
		entity = InterfaceCasting.quick(entity, IEnterpriseKeys);
		const baseUsr = await this.appSvc.baseUser.assign(entity.user);
		return super.save({ ...entity, user: baseUsr }, options);
	}

	/**
	 * Assign enterprise
	 */
	async assign(
		input: IEnterpriseAssign & IBaseUser,
		avatar: Express.Multer.File,
	): Promise<Enterprise> {
		input = InterfaceCasting.quick(input, [
			...IEnterpriseAssignKeys,
			...IBaseUserKeys,
		]);

		const avatarFile = await this.fileSvc.assign(avatar, null, {
			fileName: `${input.name}.${input.industry}.logo`,
		});

		try {
			return await this.save({
				...input,
				user: InterfaceCasting.quick(input, IBaseUserKeys),
			});
		} catch (error) {
			await this.fileSvc.remove({ ...avatarFile });
			throw new BadRequestException(`Null value in field ${error['column']}`);
		}
	}
}
