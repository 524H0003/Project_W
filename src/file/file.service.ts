import { createHash } from 'crypto';
import { readdir, readFileSync } from 'fs';
import { extname, join } from 'path';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { File } from './file.entity';
import { AppService } from 'app/app.service';

/**
 * File services
 */
@Injectable()
export class FileService extends DatabaseRequests<File> {
	/**
	 * @ignore
	 */
	constructor(
		@InjectRepository(File) repo: Repository<File>,
		private svc: AppService,
	) {
		super(repo);

		readdir(this.rootDir, async (error, files) => {
			if (error) return;

			for (const file of files) {
				const filePath = join(this.rootDir, file);

				try {
					await this.svc.aws.upload(file, readFileSync(filePath));
				} catch (error) {
					console.error(
						`\n${'-'.repeat(30)}\nUnable to upload ${filePath}\n${'-'.repeat(30)}\n`,
						error,
					);
				}
			}
		});
	}

	/**
	 * @ignore
	 */
	private serverFilesReg = /^.*\.server\.(.*)/g;
	/**
	 * @ignore
	 */
	private rootDir = this.svc.cfg.get('SERVER_PUBLIC');

	/**
	 * Assign file to server
	 * @param {Express.Multer.File} input - the file to assign
	 * @param {User} user - the file's assigner
	 * @param {object} serverFilesOptions - optional options
	 * @return {Promise<File>} the assigned file's infomations on database
	 */
	async assign(
		input: Express.Multer.File,
		user: User,
		serverFilesOptions?: { fileName: string },
	): Promise<File> {
		if (!input?.buffer) return null;

		const { fileName = '' } = serverFilesOptions || {},
			path = fileName
				? fileName + `.server.${extname(input.originalname)}`
				: `${createHash('sha256')
						.update(input.buffer)
						.digest('hex')}${extname(input.originalname)}`;

		await this.svc.aws.upload(path, input.buffer);

		if (!fileName)
			return this.save({ path, fileCreatedBy: { baseUser: { id: user.id } } });
	}

	/**
	 * Recieve file from server
	 * @param {string} filename - the name of recieving file
	 * @param {User} user - the user want to recieve file
	 * @return {Promise<Buffer>} the file buffer
	 */
	async recieve(filename: string, user: User): Promise<Buffer> {
		const recievedFile = await this.svc.aws.download(filename);

		if (!recievedFile) throw new BadRequestException('Fatal_Request_File');

		if (
			filename.match(this.serverFilesReg) ||
			(await this.isOwner(filename, user!.id))
		)
			return recievedFile;

		throw new BadRequestException('ForbidenFile');
	}

	/**
	 * Remove file on server
	 */
	async remove(criteria: FindOptionsWhere<File>) {
		await super.delete(criteria);
	}

	/**
	 * Find file on database
	 * @param {string} input - the file's name
	 * @param {string} ownerId - the owner's id
	 * @return {Promise<boolean>}
	 */
	async isOwner(input: string, ownerId: string): Promise<boolean> {
		return (
			(await this.findOne({
				path: input,
				fileCreatedBy: { baseUser: { id: ownerId } },
				deep: 2,
			})) !== undefined
		);
	}
}
