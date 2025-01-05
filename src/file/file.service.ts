import { createHash } from 'crypto';
import { readdir, readFileSync } from 'fs';
import { extname, join } from 'path';
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
import { DatabaseRequests } from 'app/utils/typeorm.utils';
import { FindOptionsWhere, Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { File } from './file.entity';

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

				try {
					await this.s3Send(file, readFileSync(filePath));
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
		const stream = this.asStream(response),
			chunks: Buffer[] = [];

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
		} catch (error) {
			throw new Error(
				`\n${'-'.repeat(30)}\nFatal_Upload_File\n${'-'.repeat(30)}\n`,
				error,
			);
		}
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
		} catch (error) {
			throw new Error(
				`\n${'-'.repeat(30)}\nFatal_Download_File\n${'-'.repeat(30)}\n`,
				error,
			);
		}
	}

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

		await this.s3Send(path, input.buffer);

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
		const recievedFile = await this.s3Recieve(filename);

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
