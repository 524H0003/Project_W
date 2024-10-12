import {
	BadRequestException,
	Body,
	Controller,
	HttpStatus,
	Param,
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
import { DeviceService } from 'auth/device/device.service';
import { SessionService } from 'auth/session/session.service';
import { compareSync } from 'bcrypt';
import { CookieOptions, Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { UserRecieve } from 'user/user.class';
import { ILogin, ISignUp } from 'user/user.model';
import { CurrentUser, MetaData } from './auth.guard';
import { AuthService } from './auth.service';
import { LocalHostStrategy } from './strategies/localhost.strategy';
import { HookService } from './hook/hook.service';
import { Hook } from './hook/hook.entity';
import { hash } from 'app/utils/auth.utils';

@Controller('auth')
export class AuthController {
	constructor(
		private authSvc: AuthService,
		private dvcSvc: DeviceService,
		private sesSvc: SessionService,
		private cfgSvc: ConfigService,
		private hookSvc: HookService,
	) {}

	private readonly ckiOpt: CookieOptions = {
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
	};
	private readonly rfsKey = this.cfgSvc.get('REFRESH_SECRET');
	private readonly acsKey = this.cfgSvc.get('ACCESS_SECRET');

	protected clearCookies(
		request: Request,
		response: Response,
		acs = true,
		rfs = true,
	) {
		for (const cki in request.cookies)
			if (
				(compareSync(this.acsKey, cki) && acs) ||
				(compareSync(this.rfsKey, cki) && rfs)
			)
				response.clearCookie(cki, this.ckiOpt);
	}

	protected sendBack(
		request: Request,
		response: Response,
		usrRcv: UserRecieve,
		options?: { msg?: string },
	): void {
		const { msg = 'true' } = options || {};
		this.clearCookies(request, response);
		response
			.status(HttpStatus.ACCEPTED)
			.cookie(
				hash(this.acsKey),
				this.authSvc.encrypt(
					usrRcv.accessToken,
					usrRcv.refreshToken.split('.')[2],
				),
				this.ckiOpt,
			)
			.cookie(
				hash(this.rfsKey),
				this.authSvc.encrypt(usrRcv.refreshToken),
				this.ckiOpt,
			)
			.send(msg);
	}

	@Post('login')
	@UseGuards(LocalHostStrategy)
	@UseInterceptors(NoFilesInterceptor())
	async login(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: ILogin,
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.authSvc.login(body, mtdt),
		);
	}

	@Post('signup')
	@UseGuards(LocalHostStrategy)
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

	@Post('change')
	async changePassword(
		@Req() request: Request,
		@Res({ passthrough: true }) response: Response,
		@Body() body: { email: string },
		@MetaData() mtdt: string,
	) {
		return this.sendBack(
			request,
			response,
			await this.hookSvc.assign(body.email, request.hostname, mtdt),
			{ msg: 'ReqPassChange' },
		);
	}

	@Post('hook/:token')
	@UseGuards(AuthGuard('hook'))
	async recieveHook(
		@Res({ passthrough: true }) response: Response,
		@Param('token') signature: string,
		@MetaData() mtdt: string,
		@CurrentUser() hook: Hook,
		@Body() body: { password: string },
	) {
		if (hook.mtdt === mtdt && signature == hook.signature && !hook.isUsed) {
			await this.hookSvc.terminate(hook.id);
			if (await this.authSvc.changePassword(hook.from, body.password)) {
				response.send('success');
				return;
			}
		}
		throw new BadRequestException();
	}
}
