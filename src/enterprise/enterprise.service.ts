import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
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
		super(repo, Enterprise);
	}

	/**
	 * Assign enterprise
	 * @param {IEnterpriseAssign} input - enterprise assign form
	 * @param {MulterFile} avatar - user's avatar
	 * @return {Promise<Enterprise>}
	 */
	async assign(
		{ name, industry, email, description }: IEnterpriseAssign,
		avatar: MulterFile,
	): Promise<Enterprise> {
		return this.save({
			baseUser: await this.svc.baseUser.assign({
				name,
				email,
				avatarPath: avatar
					? (
							await this.svc.file.assign(
								avatar,
								null,
								`${name}.${industry}.logo`,
							)
						).path
					: undefined,
			}),
			industry,
			description,
		});
	}

	/**
	 * Modify enterprise
	 * @param {string} entityId - enterprise's id
	 * @param {DeepPartial<Enterprise>} updatedEntity - modified enterprise
	 */
	async modify(entityId: string, updatedEntity: DeepPartial<Enterprise>) {
		if (!updatedEntity) return;

		await this.update({ baseUser: { id: entityId } }, updatedEntity);
	}

	/**
	 * Remove enterprise
	 * @param {string} entityId - enterprise's id
	 */
	async remove(entityId: string) {
		await this.delete({ baseUser: { id: entityId } });
		await this.svc.baseUser.remove(entityId);
	}
}
