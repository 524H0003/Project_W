import {
	Body,
	Controller,
	HttpStatus,
	ParseFilePipeBuilder,
	Post,
	Req,
	Res,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor, NoFilesInterceptor } from '@nestjs/platform-express';
import { compareSync } from 'bcrypt';
import { DeviceService } from 'device/device.service';
import { CookieOptions, Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { SessionService } from 'session/session.service';
import { UserRecieve } from 'user/user.class';
import { ILogin, ISignUp } from 'user/user.model';
import { hash } from 'utils/auth.utils';
import { MetaData } from './auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private dvcSvc: DeviceService,
		private sesSvc: SessionService,
		private cfgSvc: ConfigService,
	) {}

	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};
	private readonly ckiPfx = this.cfgSvc.get('SERVER_COOKIE_PREFIX');
	private readonly rfsKey = this.cfgSvc.get('REFRESH_KEY');
	private readonly acsKey = this.cfgSvc.get('ACCESS_KEY');

	clearCookies(request: Request, response: Response, acs = true, rfs = true) {
		for (const cki in request.cookies)
			if (
				(compareSync(this.acsKey, cki.substring(this.ckiPfx.length)) && acs) ||
				(compareSync(this.rfsKey, cki.substring(this.ckiPfx.length)) && rfs)
			)
				response.clearCookie(cki, this.ckiOpt);
	}

	sendBack(request: Request, response: Response, usrRcv: UserRecieve): void {
		this.clearCookies(request, response);
		response
			.cookie(
				this.ckiPfx + hash(this.rfsKey),
				this.authSvc.encrypt(usrRcv.refreshToken),
				this.ckiOpt,
			)
			.cookie(
				this.ckiPfx + hash(this.acsKey),
				this.authSvc.encrypt(
					usrRcv.accessToken,
					usrRcv.refreshToken.split('.')[2],
				),
				this.ckiOpt,
			)
			.status(HttpStatus.ACCEPTED)
			.json(true);
	}

	@Post('login')
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Body() body: ILogin,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.authSvc.login(body, mtdt),
		);
	}

	@Post('signup')
	@UseInterceptors(FileInterceptor('avatar', { storage: memoryStorage() }))
	async signUp(
		@Req() request: Request,
		@Body() body: ISignUp,
		@UploadedFile(
			new ParseFilePipeBuilder()
				.addFileTypeValidator({ fileType: '.(png|jpeg|jpg)' })
				.addMaxSizeValidator({ maxSize: (0.3).mb })
				.build({
					fileIsRequired: false,
					errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
				}),
		)
		avatar: Express.Multer.File,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.authSvc.signUp(body, mtdt, avatar || null),
		);
	}

	@Post('logout')
	@UseGuards(AuthGuard('refresh'))
	async logout(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
	) {
		await this.dvcSvc.remove(request.user['id']);
		this.sendBack(request, response, { refreshToken: '', accessToken: '' });
	}

	@Post('refresh')
	@UseGuards(AuthGuard('refresh'))
	async refresh(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@MetaData() mtdt: string,
	) {
		const sendBack = (usrRcv: UserRecieve) =>
			this.sendBack(request, response, usrRcv);
		if (request.user['lockdown']) {
			await this.dvcSvc.remove(request.user['id']);
			sendBack({ refreshToken: '', accessToken: '' });
		} else {
			if (request.user['success'] && compareSync(mtdt, request.user['ua'])) {
				sendBack(
					new UserRecieve({
						accessToken: request.user['acsTkn'],
						refreshToken: request.user['rfsTkn'],
					}),
				);
			} else sendBack(await this.sesSvc.addTokens(request.user['id']));
		}
	}
}
