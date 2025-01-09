import { Readable } from 'stream';
import {
	GetObjectCommand,
	GetObjectCommandOutput,
	S3Client,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppService } from 'app/app.service';

/**
 * AWS service
 */
@Injectable()
export class AWSService {
	/**
	 * @ignore
	 */
	constructor(@Inject(forwardRef(() => AppService)) private svc: AppService) {}

	/**
	 * @ignore
	 */
	private _client: S3Client;
	/**
	 * @ignore
	 */
	get client(): S3Client {
		if (this._client) return this._client;
		return (this._client = new S3Client({
			forcePathStyle: true,
			region: this.svc.cfg.get('AWS_REGION'),
			endpoint: this.svc.cfg.get('AWS_ENDPOINT'),
			credentials: {
				accessKeyId: this.svc.cfg.get('AWS_ACCESS_KEY_ID'),
				secretAccessKey: this.svc.cfg.get('AWS_SECRET_ACCESS_KEY'),
			},
		}));
	}

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
	async upload(fileName: string, input: Buffer) {
		try {
			await new Upload({
				client: this.client,
				params: {
					Bucket: this.svc.cfg.get('AWS_BUCKET'),
					Key: fileName,
					Body: input,
				},
			}).done();
		} catch (error) {
			throw new Error(
				`\n${'-'.repeat(30)}\nFatal_Upload_AWS\n${'-'.repeat(30)}\n`,
				error,
			);
		}
	}

	/**
	 * Recieve file from s3 server
	 * @param {string} filename - the name of recieving file
	 * @return {Promise<Buffer>} the recieved file's buffer
	 */
	async download(filename: string): Promise<Buffer> {
		try {
			return this.asBuffer(
				await this.client.send(
					new GetObjectCommand({
						Bucket: this.svc.cfg.get('AWS_BUCKET'),
						Key: filename,
					}),
				),
			);
		} catch (error) {
			throw new Error(
				`\n${'-'.repeat(30)}\nFatal_Download_AWS\n${'-'.repeat(30)}\n`,
				error,
			);
		}
	}
}
