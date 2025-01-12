import { Readable } from 'stream';
import {
	GetObjectCommand,
	GetObjectCommandOutput,
	NoSuchKey,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { AppService } from 'app/app.service';
import { lookup } from 'mime-types';

/**
 * AWS recieve object
 */
export interface AWSRecieve {
	stream: Readable;
	length: number;
	type: string;
}

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
					ContentType: lookup(fileName) as string,
				},
			}).done();
		} catch (error) {
			throw new ServerException('Fatal', 'AWS', 'Upload', error);
		}
	}

	/**
	 * Recieve file from s3 server
	 * @param {string} filename - the name of recieving file
	 * @return {Promise<AWSRecieve>}
	 */
	async download(filename: string): Promise<AWSRecieve> {
		try {
			const result = await this.client.send(
					new GetObjectCommand({
						Bucket: this.svc.cfg.get('AWS_BUCKET'),
						Key: filename,
					}),
				),
				stream = result.Body! as Readable,
				length = result.ContentLength!,
				type = result.ContentType!;

			return { stream, length, type };
		} catch (error) {
			if (
				error instanceof NoSuchKey ||
				(error as S3ServiceException).name == 'SignatureDoesNotMatch'
			)
				throw new ServerException('Invalid', 'FileName', '');

			throw new ServerException('Fatal', 'AWS', 'Download', error);
		}
	}
}
