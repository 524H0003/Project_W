import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { InterfaceCasting } from 'app/utils/utils';
import { IBaseUserKeys, IEnterpriseAssignKeys } from 'models';
import { FileService } from 'file/file.service';
import { IBaseUser } from 'app/app.model';

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
	 * Find enterprise with email
	 * @param {string} input - the user's email
	 * @return {Promise<Enterprise>} the user's infomations that found
	 */
	email(input: string): Promise<Enterprise> {
		return this.findOne({ user: { email: input.toLowerCase() } });
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
			return await this.save({ ...input, avatarPath: avatarFile?.path });
		} catch (error) {
			await this.fileSvc.delete({ ...avatarFile });
			throw new BadRequestException(`Null value in field ${error['column']}`);
		}
	}
}
