import { createReadStream, readdir } from 'fs';
import { extname, join } from 'path';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { File } from './file.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { AWSRecieve } from 'app/aws/aws.service';
import { FileUpload } from 'graphql-upload-ts';
import { createHmac } from 'node:crypto';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { Readable } from 'node:stream';

/**
 * File services
 */
@Injectable()
export class FileService extends DatabaseRequests<File> {
	/**
	 * Initiate file service
	 */
	constructor(
		@InjectRepository(File) repo: Repository<File>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		protected cfg: ConfigService,
	) {
		super(repo);

		readdir(cfg.get('SERVER_PUBLIC'), async (error, files) => {
			if (error) {
				new ServerException('Fatal', 'File', 'Read', 'server', error);
				return;
			}

			for (const file of files)
				if (file.match(this.serverFilesReg)) {
					const filePath = join(cfg.get('SERVER_PUBLIC'), file);
					try {
						await this.svc.aws.upload(file, createReadStream(filePath));
					} catch {}
				}
		});
	}

	/**
	 * @ignore
	 */
	private serverFilesReg = /^.*\.server\.(.*)/g;

	/**
	 * Assign file to server
	 * @param {MulterFile} input - the file to assign
	 * @param {User} userId - the file's assigner
	 * @param {object} serverFilesOptions - optional options
	 * @return {Promise<File>} the assigned file's infomations on database
	 */
	async assign(
		{ buffer, stream, originalname, filename }: MulterFile,
		userId: string,
		serverFilesOptions?: { fileName: string },
	): Promise<File> {
		if (!buffer) return null;

		const title = originalname || filename,
			{ fileName = '' } = serverFilesOptions || {},
			path = fileName
				? fileName + `.server.${extname(title)}`
				: `${createHmac('sha256', this.cfg.get('SERVER_SECRET')).update(buffer).digest('hex')}${extname(title)}`;

		await this.svc.aws.upload(path, (stream as Readable) ?? buffer);

		return this.save({
			path,
			title,
			fileCreatedBy: userId ? { baseUser: { id: userId } } : null,
		});
	}

	/**
	 * Recieve file from server
	 * @param {string} filename - the name of recieving file
	 * @param {string} userId - the id of user want to recieve file
	 * @return {Promise<AWSRecieve>}
	 */
	async recieve(filename: string, userId: string): Promise<AWSRecieve> {
		if (await this.isOwner(filename, userId))
			return this.svc.aws.download(filename);

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
		const file = await this.findOne({
			path: input,
			deep: 2,
		});

		return this.serverFilesReg.test(input) || file.fileCreatedBy.id == ownerId;
	}

	/**
	 * Convert graphql upload to Express.Multer.File
	 * @param {FileUpload} input - graphql upload
	 * @return {Promise<MulterFile>}
	 */
	async GQLUploadToMulterFile({
		createReadStream,
		filename,
		fieldName,
		mimetype,
		encoding,
	}: FileUpload): Promise<MulterFile> {
		const uploadFile: MulterFile = {
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
