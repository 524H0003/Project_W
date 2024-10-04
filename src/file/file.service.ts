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
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
	DatabaseRequests,
	FindOptionsWithCustom,
} from 'app/utils/typeorm.utils';
import { Repository } from 'typeorm';
import { User } from 'user/user.entity';
import { File } from './file.entity';

@Injectable()
export class FileService extends DatabaseRequests<File> {
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

	private s3Svc =
		new S3Client({
			forcePathStyle: true,
			region: this.cfgSvc.get('AWS_REGION'),
			endpoint: this.cfgSvc.get('AWS_ENDPOINT'),
			credentials: {
				accessKeyId: this.cfgSvc.get('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.cfgSvc.get('AWS_SECRET_ACCESS_KEY'),
			},
		}) || null;
	private serverFilesReg = /^.*\.server\.(.*)/g;
	private rootDir = this.cfgSvc.get('SERVER_PUBLIC');

	private asStream(response: GetObjectCommandOutput) {
		return response.Body as Readable;
	}

	private async asBuffer(response: GetObjectCommandOutput) {
		const stream = this.asStream(response);
		const chunks: Buffer[] = [];
		return new Promise<Buffer>((resolve, reject) => {
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', (err) => reject(err));
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}

	private async asString(response: GetObjectCommandOutput) {
		const buffer = await this.asBuffer(response);
		return buffer.toString();
	}

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

	private async s3Recieve(filename: string) {
		try {
			return await this.asBuffer(
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

	async assign(
		input: Express.Multer.File,
		createdBy: User,
		serverFilesOptions?: { fileName: string },
	) {
		if (!input?.buffer) return null;
		const { fileName = '' } = serverFilesOptions || {};

		const path = fileName
			? fileName
			: `${createHash('sha256')
					.update(input.buffer)
					.digest('hex')}${extname(input.originalname)}`;

		await this.s3Send(path, input.buffer);
		writeFileSync(`${this.cfgSvc.get('SERVER_PUBLIC')}${path}`, input.buffer);

		if (!fileName) return this.save({ path, createdBy });
	}

	async recieve(filename: string, user: User) {
		const fileOnline = await this.s3Recieve(filename);
		if (fileOnline) {
			writeFileSync(
				`${this.cfgSvc.get('SERVER_PUBLIC')}${filename}`,
				fileOnline,
			);
		}

		const filePath = realpathSync(resolve(this.rootDir, filename));
		if (filePath.startsWith(resolve(this.rootDir)) && existsSync(filePath)) {
			if (filename.match(this.serverFilesReg)) return filename;

			const file = await this.path(filename, user?.id, {
				deep: 2,
				relations: ['createdBy'],
			});
			if (user?.id === file.createdBy.id) return filename;
		}
		return false;
	}

	path(input: string, userId: string, options: FindOptionsWithCustom<File>) {
		return this.findOne({ path: input, ...options, createdBy: { id: userId } });
	}
}
