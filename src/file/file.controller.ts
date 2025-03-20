import {
	Controller,
	Get,
	Param,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { FileGuard, GetRequest } from 'auth/guards';
import { FastifyReply } from 'fastify';
import { User } from 'user/user.entity';
import { AppService } from 'app/app.service';
import { CacheInterceptor } from '@nestjs/cache-manager';

/**
 * File controller
 */
@Controller({ version: '1', path: 'file' })
@UseInterceptors(CacheInterceptor)
export class FileController {
	/**
	 * Initiate file controller
	 */
	constructor(protected svc: AppService) {}

	/**
	 * Get uploaded file
	 * @param {string} fileName - the name of file
	 * @param {FastifyReply} res - the server's response
	 * @param {User} user - the current processing user
	 */
	@Get(':filename') @UseGuards(FileGuard) async seeUploadedFile(
		@Param('filename') fileName: string,
		@Res() res: FastifyReply,
		@GetRequest('user') user: User,
	) {
		const { stream, type, length } = await this.svc.file.recieve(
			fileName,
			user?.id,
		);

		res
			.headers({ 'content-type': type, 'content-length': length })
			.send(stream);
	}
}
