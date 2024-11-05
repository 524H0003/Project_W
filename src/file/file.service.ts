import { createHash } from 'crypto';
import {
	existsSync,
	readdir,
	readFileSync,
	realpathSync,
	writeFileSync,
} from 'fs';
import { extname, join, resolve } from 'path';
import { Readable } from 'stream';
import {
	GetObjectCommand,
	GetObjectCommandOutput,
	S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DatabaseRequests,
	FindOptionsWithCustom,
} from 'app/utils/typeorm.utils';
import { DeleteResult, FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { File } from './file.entity';
import { BaseUser } from 'app/app.entity';

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
		private cfgSvc: ConfigService,
	) {
		super(repo);

		readdir(this.rootDir, async (error, files) => {
			if (error) return;

			for (const file of files) {
				const filePath = join(this.rootDir, file);

				await this.s3Send(file, readFileSync(filePath));
			}
		});
	}
	/**
	 * @ignore
	 */
	private s3Svc = this.cfgSvc.get('AWS_REGION')
		? new S3Client({
				forcePathStyle: true,
				region: this.cfgSvc.get('AWS_REGION'),
				endpoint: this.cfgSvc.get('AWS_ENDPOINT'),
				credentials: {
					accessKeyId: this.cfgSvc.get('AWS_ACCESS_KEY_ID'),
					secretAccessKey: this.cfgSvc.get('AWS_SECRET_ACCESS_KEY'),
				},
			})
		: null;
	/**
	 * @ignore
	 */
	private serverFilesReg = /^.*\.server\.(.*)/g;
	/**
	 * @ignore
	 */
	private rootDir = this.cfgSvc.get('SERVER_PUBLIC');

	/**
	 * Convert to stream
	 * @param {GetObjectCommandOutput} response - input
	 * @return {Readable} output
	 */
	private asStream(response: GetObjectCommandOutput): Readable {
		return response.Body as Readable;
	}

	/**
	 * Convert to buffer
	 * @param {GetObjectCommandOutput} response - input
	 * @return {Promise<Buffer>} output
	 */
	private async asBuffer(response: GetObjectCommandOutput): Promise<Buffer> {
		const stream = this.asStream(response);
		const chunks: Buffer[] = [];
		return new Promise<Buffer>((resolve, reject) => {
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', (err) => reject(err));
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	/**
	 * Send file to s3 server
	 * @param {string} fileName - the name of sending file
	 * @param {Buffer} input - file's buffer to send
	 */
	private async s3Send(fileName: string, input: Buffer) {
		try {
			await new Upload({
				client: this.s3Svc,
				params: {
					Bucket: this.cfgSvc.get('AWS_BUCKET'),
					Key: fileName,
					Body: input,
				},
			}).done();
		} catch {}
	}

	/**
	 * Recieve file from s3 server
	 * @param {string} filename - the name of recieving file
	 * @return {Promise<Buffer>} the recieved file's buffer
	 */
	private async s3Recieve(filename: string): Promise<Buffer> {
		try {
			return this.asBuffer(
				await this.s3Svc.send(
					new GetObjectCommand({
						Bucket: this.cfgSvc.get('AWS_BUCKET'),
						Key: filename,
					}),
				),
			);
		} catch {
			return null;
		}
	}

	/**
	 * Assign file to server
	 * @param {Express.Multer.File} input - the file to assign
	 * @param {User} createdBy - the file's assigner
	 * @param {object} serverFilesOptions - optional options
	 * @return {Promise<File>} the assigned file's infomations on database
	 */
	async assign(
		input: Express.Multer.File,
		createdBy: User,
		serverFilesOptions?: { fileName: string },
	): Promise<File> {
		if (!input?.buffer) return null;
		const { fileName = '' } = serverFilesOptions || {};

		const path = fileName
			? fileName + `.server.${extname(input.originalname)}`
			: `${createHash('sha256')
					.update(input.buffer)
					.digest('hex')}${extname(input.originalname)}`;

		await this.s3Send(path, input.buffer);
		writeFileSync(`${this.cfgSvc.get('SERVER_PUBLIC')}${path}`, input.buffer);

		if (!fileName) return this.save({ path, createdBy });
	}

	/**
	 * Recieve file from server
	 * @param {string} filename - the name of recieving file
	 * @param {BaseUser} user - the user want to recieve file
	 * @return {Promise<string>} the file name or rejecting request
	 */
	async recieve(filename: string, user: BaseUser): Promise<string> {
		const fileOnline = await this.s3Recieve(filename);
		if (fileOnline) {
			writeFileSync(
				`${this.cfgSvc.get('SERVER_PUBLIC')}${filename}`,
				fileOnline,
			);
		}

		try {
			const filePath = realpathSync(resolve(this.rootDir, filename));
			if (filePath.startsWith(resolve(this.rootDir)) && existsSync(filePath)) {
				if (filename.match(this.serverFilesReg)) return filename;

				const file = await this.path(filename, user?.id, { deep: 2 });

				if (user?.id === file.createdBy.base.id) return filename;
				throw new BadRequestException('ForbidenFile');
			}
			return null;
		} catch (error) {
			throw new BadRequestException('InvalidFileRequest');
		}
	}

	/**
	 * Remove file on server
	 */
	remove(criteria: FindOptionsWhere<File>): Promise<DeleteResult> {
		return super.delete(criteria);
	}

	/**
	 * Find file on database
	 * @param {string} input - the file's name
	 * @param {string} userId - the id of request's user
	 * @param {FindOptionsWithCustom<File>} options - the function's option
	 * @return {Promise<File>}
	 */
	path(
		input: string,
		userId: string,
		options: FindOptionsWithCustom<File>,
	): Promise<File> {
		return this.findOne({
			path: input,
			...options,
			createdBy: { base: { id: userId } },
		});
	}
}
