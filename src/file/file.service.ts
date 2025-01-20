import { createHash } from 'crypto';
import { createReadStream, readdir } from 'fs';
import { extname, join } from 'path';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { File } from './file.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { AWSRecieve } from 'app/aws/aws.service';
import { FileUpload } from 'graphql-upload-ts';

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
		@Inject(forwardRef(() => AppService))
		private svc: AppService,
		cfg: ConfigService,
	) {
		super(repo);

		readdir(cfg.get('SERVER_PUBLIC'), async (error, files) => {
			if (error) {
				new ServerException('Fatal', 'File', 'Read', 'server');
				return;
			}

			for (const file of files) {
				const filePath = join(cfg.get('SERVER_PUBLIC'), file);

				await this.svc.aws.upload(file, createReadStream(filePath));
			}
		});
	}

	/**
	 * @ignore
	 */
	private serverFilesReg = /^.*\.server\.(.*)/g;

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

		await this.svc.aws.upload(path, input.stream);

		if (!fileName)
			return this.save({ path, fileCreatedBy: { baseUser: { id: user.id } } });
	}

	/**
	 * Recieve file from server
	 * @param {string} filename - the name of recieving file
	 * @param {User} user - the user want to recieve file
	 * @return {Promise<AWSRecieve>}
	 */
	async recieve(filename: string, user: User): Promise<AWSRecieve> {
		const recievedFile = await this.svc.aws.download(filename);

		if (
			filename.match(this.serverFilesReg) ||
			(await this.isOwner(filename, user!.id))
		)
			return recievedFile;

		throw new ServerException('Forbidden', 'File', 'Access', 'user');
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

	/**
	 * Convert graphql upload to Express.Multer.File
	 * @param {FileUpload} input - graphql upload
	 * @return {Promise<Express.Multer.File>}
	 */
	async GQLUploadToMulterFile(input: FileUpload): Promise<Express.Multer.File> {
		const { createReadStream, filename, fieldName, mimetype, encoding } = input,
			uploadFile: Express.Multer.File = {
				fieldname: fieldName,
				encoding: encoding,
				mimetype: mimetype,
				stream: createReadStream(),
				filename: filename,
				buffer: null,
				originalname: undefined,
				size: undefined,
				destination: undefined,
				path: undefined,
			};

		uploadFile.buffer = await new Promise((resolve, reject) => {
			const chunks = [];
			uploadFile.stream.on('data', (data) => {
				if (typeof data === 'string') chunks.push(Buffer.from(data, 'utf-8'));
				else if (data instanceof Buffer) chunks.push(data);
				else chunks.push(Buffer.from(JSON.stringify(data), 'utf-8'));
			});
			uploadFile.stream.on('end', () => {
				resolve(Buffer.concat(chunks));
			});
			uploadFile.stream.on('error', reject);
		});

		return uploadFile;
	}
}
