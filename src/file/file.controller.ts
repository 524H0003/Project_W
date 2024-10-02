import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CurrentUser } from 'auth/auth.guard';
import { Response } from 'express';
import { User } from 'user/user.entity';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
	constructor(
		private fileSvc: FileService,
		private cfgSvc: ConfigService,
	) {}

	private rootDir = this.cfgSvc.get('SERVER_PUBLIC');

	@Get(':filename')
	async seeUploadedFile(
		@Param('filename') filename: string,
		@Res() res: Response,
		@CurrentUser() user: User,
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
