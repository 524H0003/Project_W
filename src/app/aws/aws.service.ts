import { Readable } from 'stream';
import {
	GetObjectCommand,
	NoSuchKey,
	S3Client,
	S3ServiceException,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { lookup } from 'mime-types';
import { AppService } from 'app/app.service';

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
	 * Initiate aws service
	 */
	constructor(@Inject(forwardRef(() => AppService)) private svc: AppService) {}

	/**
	 * Aws client
	 */
	private _client: S3Client;
	/**
	 * @ignore
	 */
	get client(): S3Client {
		if (this._client) return this._client;

		const { config } = this.svc;
		return (this._client = new S3Client({
			forcePathStyle: true,
			region: config.get('AWS_REGION'),
			endpoint: config.get('AWS_ENDPOINT'),
			credentials: {
				accessKeyId: config.get('AWS_ACCESS_KEY_ID'),
				secretAccessKey: config.get('AWS_SECRET_ACCESS_KEY'),
			},
		}));
	}

	/**
	 * Send file to s3 server
	 * @param {string} fileName - the name of sending file
	 * @param {Readable | Buffer} input - file's buffer to send
	 */
	async upload(fileName: string, input: Readable | Buffer) {
		try {
			await new Upload({
				client: this.client,
				params: {
					Bucket: this.svc.config.get('AWS_BUCKET'),
					Key: fileName,
					Body: input,
					ContentType: lookup(fileName) as string,
				},
			}).done();
		} catch (error) {
			throw new ServerException('Fatal', 'AWS', 'Upload', error as Error);
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
						Bucket: this.svc.config.get('AWS_BUCKET'),
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

			throw new ServerException('Fatal', 'AWS', 'Download', error as Error);
		}
	}
}
