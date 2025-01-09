import {
	Controller,
	Get,
	HttpStatus,
	Param,
	Res,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from 'auth/auth.guard';
import { Response } from 'express';
import { User } from 'user/user.entity';
import { AuthGuard } from '@nestjs/passport';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { AppService } from 'app/app.service';

/**
 * File controller
 */
@Controller('file')
@UseInterceptors(CacheInterceptor)
export class FileController {
	/**
	 * @ignore
	 */
	constructor(private svc: AppService) {}

	/**
	 * Get uploaded file
	 * @param {string} fileName - the name of file
	 * @param {Response} res - the server's response
	 * @param {User} user - the current processing user
	 */
	@Get(':filename')
	@UseGuards(AuthGuard('access'))
	async seeUploadedFile(
		@Param('filename') fileName: string,
		@Res() res: Response,
		@CurrentUser() user: User,
	) {
		return res
			.status(HttpStatus.ACCEPTED)
			.set({
				'Content-Type': 'application/octet-stream',
				'Content-Disposition': `attachment; filename="${fileName}"`,
			})
			.send(await this.svc.file.recieve(fileName, user));
	}
}
