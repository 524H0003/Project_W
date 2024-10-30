import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from 'auth/auth.guard';
import { Response } from 'express';
import { FileService } from './file.service';
import { BaseUser } from 'app/app.entity';

/**
 * File controller
 */
@Controller('file')
export class FileController {
	/**
	 * @ignore
	 */
	constructor(
		private fileSvc: FileService,
		private cfgSvc: ConfigService,
	) {}

	private rootDir = this.cfgSvc.get('SERVER_PUBLIC');

	/**
	 * Get uploaded file
	 * @param {string} filename - the name of file
	 * @param {Response} res - the server's response
	 * @param {User} user - the current processing user
	 */
	@Get(':filename')
	async seeUploadedFile(
		@Param('filename') filename: string,
		@Res() res: Response,
		@CurrentUser() user: BaseUser,
	) {
		const file = await this.fileSvc.recieve(filename, user);
		if (file)
			return res
				.status(HttpStatus.ACCEPTED)
				.sendFile(filename, { root: this.rootDir });
		return res
			.status(HttpStatus.BAD_REQUEST)
			.send({ error: 'Invalid request' });
	}
}
