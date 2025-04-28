import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { Enterprise } from './enterprise.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { IEnterpriseAssign } from './enterprise.model';
import { AppService } from 'app/app.service';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { IEnterpriseRelationshipsKeys } from 'build/models';

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

	// Abstract
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

	public async modify(
		id: string,
		update: DeepPartial<Enterprise>,
	): Promise<void> {
		await this.svc.baseUser.modify(id, update.baseUser);
		update = InterfaceCasting.delete(update, IEnterpriseRelationshipsKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update);
	}
}
