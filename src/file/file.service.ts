import { createReadStream, readdir } from 'fs';
import { extname, join } from 'path';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DatabaseRequests } from 'app/typeorm/typeorm.utils';
import { DeepPartial, Repository } from 'typeorm';
import { File } from './file.entity';
import { AppService } from 'app/app.service';
import { ConfigService } from '@nestjs/config';
import { AWSRecieve } from 'file/aws/aws.service';
import { FileUpload } from 'graphql-upload-ts';
import { createHmac } from 'node:crypto';
import { File as MulterFile } from 'fastify-multer/lib/interfaces';
import { RequireOnlyOneOptionalRest } from 'app/utils/model.utils';
import { IFileRelationshipKeys } from 'build/models';

/**
 * Convert a stream to buffer
 * @param {NodeJS.ReadableStream} stream - input stream
 * @return {Promise<Buffer>}
 */
async function stream2buffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
	return new Promise<Buffer>((resolve, reject) => {
		const _buf = Array<any>();

		stream.on('data', (chunk) => _buf.push(chunk));
		stream.on('end', () => resolve(Buffer.concat(_buf)));
		stream.on('error', (err) => reject(`error converting stream - ${err}`));
	});
}

/**
 * File services
 */
@Injectable()
export class FileService extends DatabaseRequests<File> {
	/**
	 * Server file regular expression
	 */
	private serverFilesReg = /^[^.]+\.server\.[^.]+$/;

	/**
	 * Initiate file service
	 */
	constructor(
		@InjectRepository(File) repo: Repository<File>,
		@Inject(forwardRef(() => AppService)) private svc: AppService,
		protected cfg: ConfigService,
	) {
		super(repo, File);

		readdir(cfg.get('SERVER_PUBLIC'), async (error: Error, files) => {
			if (error) {
				new ServerException('Fatal', 'File', 'Read', error);
				return;
			}

			for (const file of files)
				if (this.serverFilesReg.test(`${file}`)) {
					const filePath = join(cfg.get('SERVER_PUBLIC'), file);
					try {
						await this.assign(
							{ stream: createReadStream(filePath), originalname: file },
							null,
							file.split('.')[0],
						);
					} catch {}
				}
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

		throw new ServerException('Forbidden', 'File', 'Access');
	}

	/**
	 * Find file on database
	 * @param {string} path - the file's path on server
	 * @param {string} ownerId - the owner's id
	 * @return {Promise<boolean>}
	 */
	async isOwner(path: string, ownerId: string): Promise<boolean> {
		const file = await this.findOne({ path, deep: 2 });

		return (
			this.serverFilesReg.test(`${path}`) || file?.fileCreatedBy.id == ownerId
		);
	}

	/**
	 * Convert graphql upload to Express.Multer.File
	 * @param {FileUpload} input - graphql upload
	 * @return {Promise<MulterFile>}
	 */
	GQLUploadToMulterFile({
		createReadStream,
		filename,
		fieldName,
		mimetype,
		encoding,
	}: FileUpload): MulterFile {
		const uploadFile: MulterFile = {
			fieldname: fieldName,
			encoding: encoding,
			mimetype: mimetype,
			stream: createReadStream(),
			filename: filename,
			buffer: null,
			originalname: filename,
			size: undefined,
			destination: undefined,
			path: undefined,
		};

		return uploadFile;
	}

	// Abstract
	/**
	 * Assign file to server
	 * @param {MulterFile} file - the file to assign
	 * @param {Buffer} file.buffer - buffer of file
	 * @param {NodeJS.ReadableStream} file.stream - stream of file
	 * @param {string} file.originalname - name of file
	 * @param {string} userId - the file's assigner id
	 * @param {string} serverFileName - name of file to assign as server file
	 * @return {Promise<File>}
	 */
	async assign(
		{
			buffer,
			stream,
			originalname,
		}:
			| (RequireOnlyOneOptionalRest<MulterFile, 'stream' | 'buffer'> &
					Required<Pick<MulterFile, 'originalname'>>)
			| MulterFile,
		userId: string,
		serverFileName?: string,
	): Promise<File> {
		buffer = buffer || (await stream2buffer(stream));

		if (!buffer) return null;

		const title = originalname,
			path = serverFileName
				? serverFileName + `.server${extname(title)}`
				: `${createHmac('sha256', this.cfg.get('SERVER_SECRET')).update(buffer).digest('base64url')}${extname(title)}`;

		await this.svc.aws.upload(path, buffer);

		return this.save({
			path,
			title,
			fileCreatedBy: userId ? { id: userId } : null,
		});
	}

	public modify(
		id: string,
		update: DeepPartial<File>,
		raw?: boolean,
	): Promise<void> {
		update = InterfaceCasting.delete(update, IFileRelationshipKeys);
		if (!Object.keys(update).length) return;
		return this.update({ id }, update, raw);
	}
}
