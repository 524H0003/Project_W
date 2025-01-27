import { Controller, Get, Param, Res } from '@nestjs/common';
import { CurrentUser } from 'auth/auth.guard';
import { Response } from 'express';
import { User } from 'user/user.entity';
import { AppService } from 'app/app.service';

/**
 * File controller
 */
@Controller('file')
export class FileController {
	constructor(private svc: AppService) {}

	/**
	 * Get uploaded file
	 * @param {string} fileName - the name of file
	 * @param {Response} res - the server's response
	 * @param {User} user - the current processing user
	 */
	@Get(':filename') async seeUploadedFile(
		@Param('filename') fileName: string,
		@Res() res: Response,
		@CurrentUser({ required: false }) user: User,
	) {
		const { stream, type, length } = await this.svc.file.recieve(
			fileName,
			user,
		);

		res.set({ 'Content-Type': type, 'Content-Length': length });

		stream.pipe(res);
	}
}
