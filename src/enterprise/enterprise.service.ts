import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IEnterpriseAssignKeys } from 'models';
import { FileService } from 'file/file.service';

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
	) {
		super(repo);
	}

	/**
	 * Assign enterprise
	 */
	async assign(
		input: IEnterpriseAssign,
		avatar: Express.Multer.File,
	): Promise<Enterprise> {
		input = InterfaceCasting.quick(input, IEnterpriseAssignKeys);

		const avatarFile = await this.fileSvc.assign(avatar, null, {
			fileName: `${input.name}.${input.industry}.logo`,
		});

		try {
			return await this.save({
				...input,
				avatarPath: avatarFile?.path,
			});
		} catch (error) {
			await this.fileSvc.delete({ ...avatarFile });
			throw new BadRequestException(`Null value in field ${error['column']}`);
		}
	}
}
