import { Controller, Get, Param, Res } from '@nestjs/common';
import { GetRequest } from 'auth/guards/access.guard';
import { FastifyReply } from 'fastify';
import { User } from 'user/user.entity';
import { AppService } from 'app/app.service';

/**
 * File controller
 */
@Controller('file')
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
	@Get(':filename') async seeUploadedFile(
		@Param('filename') fileName: string,
		@Res() res: FastifyReply,
		@GetRequest('user') user: User,
	) {
		const { stream, type, length } = await this.svc.file.recieve(
			fileName,
			user,
		);

		res.headers({ 'content-type': type, 'content-length': length });

		stream.pipe(await res);
	}
}
